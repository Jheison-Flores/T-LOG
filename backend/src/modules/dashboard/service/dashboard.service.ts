import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Product } from '../../products/entities/product.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { Inventory } from '../../inventory/entities/inventory.entity';

import { Purchase } from '../../purchases/entities/purchase.entity';

import { Request } from '../../requests/entities/request.entity';

import { StockMovement } from '../../stock-movements/entities/stock-movement.entity';

import { User } from '../../users/entities/user.entity';

import { RemissionGuide } from '../../remission-guides/entities/remission-guide.entity';

import { RouteSheet } from '../../route-sheets/entities/route-sheet.entity';

import { RequestStatus } from '../../requests/entities/request-status.enum';

import { RouteSheetStatus } from '../../route-sheets/entities/route-sheet-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,

    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RemissionGuide)
    private readonly remissionGuideRepository: Repository<RemissionGuide>,

    @InjectRepository(RouteSheet)
    private readonly routeSheetRepository: Repository<RouteSheet>,
  ) {}

  // ============================================================
  // USUARIO
  // ============================================================

  private async getAuthenticatedUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },

      relations: {
        role: true,
        warehouse: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (!user.isActive) {
      throw new BadRequestException('El usuario se encuentra inactivo.');
    }

    return user;
  }

  // ============================================================
  // ACCESO
  // ============================================================

  private hasGlobalAccess(user: User): boolean {
    return user.role?.code === 'ADMIN';
  }

  private getUserWarehouseId(user: User): number {
    if (!user.warehouse) {
      throw new BadRequestException(
        'El usuario de logística no tiene una mina o almacén asignado.',
      );
    }

    return user.warehouse.id;
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  async getDashboard(userId: number) {
    const user = await this.getAuthenticatedUser(userId);

    const warehouseId = this.hasGlobalAccess(user)
      ? null
      : this.getUserWarehouseId(user);

    const [inventory, requests, purchases, movements, guides, alerts] =
      await Promise.all([
        this.getInventoryIndicators(warehouseId),

        this.getRequestIndicators(warehouseId),

        this.getPurchaseIndicators(warehouseId),

        this.getMovementIndicators(warehouseId),

        this.getGuideIndicators(warehouseId),

        this.getAlerts(warehouseId),
      ]);

    const summary = await this.getSummary(
      warehouseId,
      inventory,
      requests,
      purchases,
      movements,
      guides,
    );

    return {
      scope: {
        global: warehouseId === null,

        warehouse: warehouseId === null ? null : user.warehouse,
      },

      summary,

      inventory,

      requests,

      purchases,

      guides,

      movements,

      alerts,
    };
  }

  // ============================================================
  // INVENTARIO
  // ============================================================

  private async getInventoryIndicators(warehouseId: number | null) {
    const query = this.inventoryRepository
      .createQueryBuilder('inventory')

      .leftJoinAndSelect('inventory.product', 'product')

      .leftJoinAndSelect('product.category', 'category')

      .leftJoinAndSelect('inventory.warehouse', 'warehouse');

    if (warehouseId !== null) {
      query.andWhere('warehouse.id = :warehouseId', {
        warehouseId,
      });
    }

    const inventory = await query.getMany();

    const totalInventoryRecords = inventory.length;

    const lowStockProducts = inventory.filter(
      (item) =>
        Number(item.quantity) > 0 &&
        Number(item.quantity) <= Number(item.product.minimumStock),
    ).length;

    const outOfStockProducts = inventory.filter(
      (item) => Number(item.quantity) === 0,
    ).length;

    return {
      totalInventoryRecords,

      lowStockProducts,

      outOfStockProducts,
    };
  }

  // ============================================================
  // REQUERIMIENTOS
  // ============================================================

  private async getRequestIndicators(warehouseId: number | null) {
    const baseQuery = () => {
      const query = this.requestRepository
        .createQueryBuilder('request')

        .leftJoin('request.warehouse', 'warehouse');

      if (warehouseId !== null) {
        query.andWhere('warehouse.id = :warehouseId', {
          warehouseId,
        });
      }

      return query;
    };

    const [
      pendingRequests,
      approvedRequests,
      inProgressRequests,
      rejectedRequests,
      deliveredRequests,
      completedRequests,
    ] = await Promise.all([
      baseQuery()
        .andWhere('request.status = :status', {
          status: RequestStatus.PENDING,
        })
        .getCount(),

      baseQuery()
        .andWhere('request.status = :status', {
          status: RequestStatus.APPROVED,
        })
        .getCount(),

      baseQuery()
        .andWhere('request.status IN (:...statuses)', {
          statuses: ['PARTIAL', 'IN_PROGRESS'],
        })
        .getCount(),

      baseQuery()
        .andWhere('request.status = :status', {
          status: RequestStatus.REJECTED,
        })
        .getCount(),

      baseQuery()
        .andWhere('request.status = :status', {
          status: RequestStatus.DELIVERED,
        })
        .getCount(),

      baseQuery()
        .andWhere('request.status = :status', {
          status: 'COMPLETED',
        })
        .getCount(),
    ]);

    return {
      pendingRequests,

      approvedRequests,

      inProgressRequests,

      rejectedRequests,

      deliveredRequests,

      completedRequests,
    };
  }

  // ============================================================
  // ÓRDENES DE COMPRA
  //
  // Purchase YA tiene warehouse.
  // LOGISTICS ve únicamente las O.C. de su unidad.
  // ============================================================

  private async getPurchaseIndicators(warehouseId: number | null) {
    const baseQuery = () => {
      const query = this.purchaseRepository
        .createQueryBuilder('purchase')

        .leftJoin('purchase.warehouse', 'warehouse');

      if (warehouseId !== null) {
        query.andWhere('warehouse.id = :warehouseId', {
          warehouseId,
        });
      }

      return query;
    };

    const totalPurchases = await baseQuery().getCount();

    const pendingReceipt = await baseQuery()
      .andWhere('purchase.status <> :receivedStatus', {
        receivedStatus: 'RECEIVED',
      })
      .getCount();

    const recentQuery = this.purchaseRepository
      .createQueryBuilder('purchase')

      .leftJoinAndSelect('purchase.warehouse', 'warehouse')

      .leftJoinAndSelect('purchase.supplier', 'supplier')

      .orderBy('purchase.createdAt', 'DESC')

      .take(5);

    if (warehouseId !== null) {
      recentQuery.andWhere('warehouse.id = :warehouseId', {
        warehouseId,
      });
    }

    const recentPurchases = await recentQuery.getMany();

    return {
      totalPurchases,

      pendingReceipt,

      recentPurchases,
    };
  }

  // ============================================================
  // GUÍAS / RECEPCIÓN
  //
  // Solo REQUEST y MANUAL_WAREHOUSE forman parte del flujo mina.
  // EXTERNAL_SERVICE no genera Hoja de Recorrido.
  // ============================================================

  private async getGuideIndicators(warehouseId: number | null) {
    const guideQuery = this.remissionGuideRepository
      .createQueryBuilder('guide')

      .leftJoinAndSelect('guide.destinationWarehouse', 'destinationWarehouse')

      .where('guide.status = :status', {
        status: 'ISSUED',
      })

      .andWhere('guide.guideType IN (:...guideTypes)', {
        guideTypes: ['REQUEST', 'MANUAL_WAREHOUSE'],
      });

    if (warehouseId !== null) {
      guideQuery.andWhere('destinationWarehouse.id = :warehouseId', {
        warehouseId,
      });
    }

    const issuedGuides = await guideQuery
      .orderBy('guide.createdAt', 'DESC')
      .getMany();

    const routeSheetQuery = this.routeSheetRepository
      .createQueryBuilder('routeSheet')

      .leftJoinAndSelect('routeSheet.remissionGuide', 'remissionGuide')

      .leftJoinAndSelect('routeSheet.warehouse', 'warehouse');

    if (warehouseId !== null) {
      routeSheetQuery.andWhere('warehouse.id = :warehouseId', {
        warehouseId,
      });
    }

    const routeSheets = await routeSheetQuery.getMany();

    const guideIdsWithRouteSheet = new Set(
      routeSheets.map((sheet) => sheet.remissionGuide.id),
    );

    const pendingReceptionGuides = issuedGuides.filter(
      (guide) => !guideIdsWithRouteSheet.has(guide.id),
    );

    const routeSheetsWithObservations = routeSheets.filter(
      (sheet) => sheet.status === RouteSheetStatus.WITH_OBSERVATIONS,
    ).length;

    return {
      issuedGuides: issuedGuides.length,

      pendingRouteSheets: pendingReceptionGuides.length,

      routeSheetsWithObservations,

      recentPendingReceptionGuides: pendingReceptionGuides
        .slice(0, 5)
        .map((guide) => ({
          id: guide.id,

          fullNumber: guide.fullNumber,

          transferStartDate: guide.transferStartDate,

          destinationWarehouse: guide.destinationWarehouse,
        })),
    };
  }

  // ============================================================
  // MOVIMIENTOS
  // ============================================================

  private async getMovementIndicators(warehouseId: number | null) {
    const query = this.movementRepository
      .createQueryBuilder('movement')

      .leftJoinAndSelect('movement.sourceInventory', 'sourceInventory')

      .leftJoinAndSelect('sourceInventory.product', 'sourceProduct')

      .leftJoinAndSelect('sourceInventory.warehouse', 'sourceWarehouse')

      .leftJoinAndSelect(
        'movement.destinationInventory',
        'destinationInventory',
      )

      .leftJoinAndSelect('destinationInventory.product', 'destinationProduct')

      .leftJoinAndSelect(
        'destinationInventory.warehouse',
        'destinationWarehouse',
      )

      .leftJoinAndSelect('movement.user', 'user');

    if (warehouseId !== null) {
      query.andWhere(
        `(
          sourceWarehouse.id = :warehouseId
          OR
          destinationWarehouse.id = :warehouseId
        )`,
        {
          warehouseId,
        },
      );
    }

    const totalMovements = await query.clone().getCount();

    const recentMovements = await query
      .orderBy('movement.createdAt', 'DESC')

      .take(8)

      .getMany();

    return {
      totalMovements,

      recentMovements,
    };
  }

  // ============================================================
  // ALERTAS
  // ============================================================

  private async getAlerts(warehouseId: number | null) {
    const inventoryQuery = this.inventoryRepository
      .createQueryBuilder('inventory')

      .leftJoinAndSelect('inventory.product', 'product')

      .leftJoinAndSelect('product.category', 'category')

      .leftJoinAndSelect('inventory.warehouse', 'warehouse');

    if (warehouseId !== null) {
      inventoryQuery.andWhere('warehouse.id = :warehouseId', {
        warehouseId,
      });
    }

    const inventory = await inventoryQuery.getMany();

    const lowStockAlerts = inventory
      .filter(
        (item) =>
          item.product &&
          Number(item.quantity) <= Number(item.product.minimumStock),
      )
      .sort((a, b) => Number(a.quantity) - Number(b.quantity));

    const requestQuery = this.requestRepository
      .createQueryBuilder('request')

      .leftJoinAndSelect('request.warehouse', 'warehouse')

      .leftJoinAndSelect('request.createdBy', 'createdBy')

      .where('request.status = :status', {
        status: RequestStatus.PENDING,
      });

    if (warehouseId !== null) {
      requestQuery.andWhere('warehouse.id = :warehouseId', {
        warehouseId,
      });
    }

    const pendingRequestsAlerts = await requestQuery
      .orderBy('request.createdAt', 'DESC')

      .take(8)

      .getMany();

    return {
      lowStockAlerts,

      pendingRequestsAlerts,
    };
  }

  // ============================================================
  // RESUMEN
  // ============================================================

  private async getSummary(
    warehouseId: number | null,

    inventory: {
      totalInventoryRecords: number;
      lowStockProducts: number;
      outOfStockProducts: number;
    },

    requests: {
      pendingRequests: number;
      approvedRequests: number;
      inProgressRequests: number;
      rejectedRequests: number;
      deliveredRequests: number;
      completedRequests: number;
    },

    purchases: {
      totalPurchases: number;
      pendingReceipt: number;
    },

    movements: {
      totalMovements: number;
    },

    guides: {
      issuedGuides: number;
      pendingRouteSheets: number;
      routeSheetsWithObservations: number;
    },
  ) {
    let totalProducts = 0;

    let totalWarehouses = 1;

    if (warehouseId === null) {
      [totalProducts, totalWarehouses] = await Promise.all([
        this.productRepository.count(),

        this.warehouseRepository.count(),
      ]);
    } else {
      const result = await this.inventoryRepository
        .createQueryBuilder('inventory')

        .select('COUNT(DISTINCT inventory.product_id)', 'total')

        .where('inventory.warehouse_id = :warehouseId', {
          warehouseId,
        })

        .getRawOne<{
          total: string | number;
        }>();

      totalProducts = Number(result?.total ?? 0);
    }

    return {
      totalProducts,

      totalWarehouses,

      totalInventoryRecords: inventory.totalInventoryRecords,

      lowStockProducts: inventory.lowStockProducts,

      outOfStockProducts: inventory.outOfStockProducts,

      totalPurchases: purchases.totalPurchases,

      pendingPurchases: purchases.pendingReceipt,

      pendingRequests: requests.pendingRequests,

      approvedRequests: requests.approvedRequests,

      inProgressRequests: requests.inProgressRequests,

      issuedGuides: guides.issuedGuides,

      pendingRouteSheets: guides.pendingRouteSheets,

      routeSheetsWithObservations: guides.routeSheetsWithObservations,

      totalMovements: movements.totalMovements,
    };
  }
}
