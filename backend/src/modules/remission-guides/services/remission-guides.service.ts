import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, Repository } from 'typeorm';

import { RemissionGuide } from '../entities/remission-guide.entity';
import { RemissionGuideDetail } from '../entities/remission-guide-detail.entity';
import { RemissionGuideStatus } from '../entities/remission-guide-status.enum';
import { CreateRemissionGuideDto } from '../dto/create-remission-guide.dto';

import { Request } from '../../requests/entities/request.entity';
import { RequestDetail } from '../../requests/entities/request-detail.entity';
import { RequestStatus } from '../../requests/entities/request-status.enum';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';

import { StockMovementsService } from '../../stock-movements/services/stock.movements.service';
import { MovementType } from '../../stock-movements/entities/movement-type.enum';

import { SettingsService } from '../../settings/services/settings.services';

import { PurchaseDetail } from '../../purchases/entities/purchase-detail.entity';
import { PurchaseCurrency } from '../../purchases/entities/purchase-currency.enum';

import { Product } from '../../products/entities/product.entity';

import { RemissionGuideType } from '../entities/remission-guide-type.enum';

@Injectable()
export class RemissionGuidesService {
  constructor(
    @InjectRepository(RemissionGuide)
    private readonly remissionGuideRepository: Repository<RemissionGuide>,

    @InjectRepository(RemissionGuideDetail)
    private readonly remissionGuideDetailRepository: Repository<RemissionGuideDetail>,

    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(RequestDetail)
    private readonly requestDetailRepository: Repository<RequestDetail>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,

    private readonly stockMovementsService: StockMovementsService,

    private readonly settingsService: SettingsService,
  ) {}

  // ============================================================
  // USUARIO
  // ============================================================

  private async getUser(
    userId: number,
    manager?: EntityManager,
  ): Promise<User> {
    const repository = manager
      ? manager.getRepository(User)
      : this.userRepository;

    const user = await repository.findOne({
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
      throw new ForbiddenException('El usuario se encuentra inactivo.');
    }

    return user;
  }

  // ============================================================
  // ROLES
  // ============================================================

  private isAdmin(user: User): boolean {
    return user.role?.code === 'ADMIN';
  }

  private isLogistics(user: User): boolean {
    return user.role?.code === 'LOGISTICS';
  }

  // ============================================================
  // PERMISOS
  // ============================================================

  private validateCanManage(user: User): void {
    if (!this.isAdmin(user) && !this.isLogistics(user)) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar Guías de Remisión.',
      );
    }

    if (this.isLogistics(user) && !user.warehouse) {
      throw new BadRequestException(
        'El usuario LOGISTICS no tiene una unidad o almacén asignado.',
      );
    }
  }

  // ============================================================
  // ALMACÉN CENTRAL
  // ============================================================

  private async getCentralWarehouse(
    manager: EntityManager,
  ): Promise<Warehouse> {
    const settings = await this.settingsService.getSettings();

    if (settings.centralWarehouse) {
      const configuredWarehouse = settings.centralWarehouse;

      if (
        typeof configuredWarehouse === 'object' &&
        configuredWarehouse !== null
      ) {
        const configuredId = Number(
          (
            configuredWarehouse as {
              id?: number | string;
            }
          ).id,
        );

        if (Number.isFinite(configuredId) && configuredId > 0) {
          const byId = await manager.findOne(Warehouse, {
            where: {
              id: configuredId,
            },
          });

          if (byId) {
            return byId;
          }
        }

        const configuredCode = String(
          (
            configuredWarehouse as {
              code?: string;
            }
          ).code ?? '',
        ).trim();

        if (configuredCode) {
          const byCode = await manager
            .getRepository(Warehouse)
            .createQueryBuilder('warehouse')
            .where('UPPER(warehouse.code) = UPPER(:code)', {
              code: configuredCode,
            })
            .getOne();

          if (byCode) {
            return byCode;
          }
        }
      }

      if (
        typeof configuredWarehouse === 'string' ||
        typeof configuredWarehouse === 'number'
      ) {
        const configuredValue = String(configuredWarehouse).trim();

        const numericId = Number(configuredValue);

        if (Number.isFinite(numericId) && numericId > 0) {
          const byId = await manager.findOne(Warehouse, {
            where: {
              id: numericId,
            },
          });

          if (byId) {
            return byId;
          }
        }

        if (configuredValue) {
          const byCode = await manager
            .getRepository(Warehouse)
            .createQueryBuilder('warehouse')
            .where('UPPER(warehouse.code) = UPPER(:code)', {
              code: configuredValue,
            })
            .getOne();

          if (byCode) {
            return byCode;
          }
        }
      }
    }

    const centralWarehouse = await manager
      .getRepository(Warehouse)
      .createQueryBuilder('warehouse')
      .where('UPPER(CAST(warehouse.type AS TEXT)) IN (:...types)', {
        types: ['MAIN', 'CENTRAL'],
      })
      .orderBy('warehouse.id', 'ASC')
      .getOne();

    if (!centralWarehouse) {
      throw new BadRequestException(
        'No se encontró configurado el almacén central de Lima.',
      );
    }

    return centralWarehouse;
  }

  // ============================================================
  // ORIGEN DE LA GUÍA
  //
  // ADMIN:
  //    Lima / almacén central.
  //
  // LOGISTICS:
  //    automáticamente su warehouse asignado.
  //
  // NUNCA se recibe sourceWarehouseId desde el frontend.
  // ============================================================

  private async getSourceWarehouse(
    user: User,
    manager: EntityManager,
  ): Promise<Warehouse> {
    if (this.isAdmin(user)) {
      return this.getCentralWarehouse(manager);
    }

    if (this.isLogistics(user)) {
      if (!user.warehouse) {
        throw new BadRequestException(
          'El usuario LOGISTICS no tiene una unidad o almacén asignado.',
        );
      }

      const warehouse = await manager.findOne(Warehouse, {
        where: {
          id: user.warehouse.id,
        },
      });

      if (!warehouse) {
        throw new NotFoundException(
          'El almacén asignado al usuario no existe.',
        );
      }

      if (!warehouse.isActive) {
        throw new BadRequestException(
          'El almacén asignado al usuario se encuentra inactivo.',
        );
      }

      return warehouse;
    }

    throw new ForbiddenException(
      'No tienes permisos para emitir Guías de Remisión.',
    );
  }

  // ============================================================
  // SERIE
  //
  // Lima mantiene 002.
  //
  // Para LOGISTICS se genera una serie propia basada en
  // el ID del almacén.
  //
  // Ejemplo:
  // Lima      -> 002
  // Warehouse 3 -> 003
  // Warehouse 4 -> 004
  // Warehouse 5 -> 005
  //
  // Esto evita que dos almacenes compartan correlativo.
  // ============================================================

  // ============================================================
  // SERIE DE LA GUÍA
  //
  // Cada almacén tiene su propia serie configurada en Warehouse.
  //
  // Poderosa -> 001
  // Lima     -> 002
  // Orex     -> 003
  // Kolpa    -> 004
  //
  // IMPORTANTE:
  // La serie NO se obtiene del ID del almacén.
  // Se obtiene de warehouse.guideSeries.
  // ============================================================

  private getGuideSeries(sourceWarehouse: Warehouse): string {
    const configuredSeries = sourceWarehouse.guideSeries?.trim();

    if (!configuredSeries) {
      throw new BadRequestException(
        `El almacén "${sourceWarehouse.name}" no tiene una serie configurada para las Guías de Remisión.`,
      );
    }

    const normalizedSeries = configuredSeries.padStart(3, '0');

    if (!/^\d{3}$/.test(normalizedSeries)) {
      throw new BadRequestException(
        `La serie "${configuredSeries}" configurada para el almacén "${sourceWarehouse.name}" no es válida. Debe ser numérica, por ejemplo 001, 002, 003 o 004.`,
      );
    }

    return normalizedSeries;
  }
  // ============================================================
  // ALCANCE DEL REQUERIMIENTO
  // ============================================================

  private validateRequestScope(user: User, request: Request): void {
    if (this.isAdmin(user)) {
      return;
    }

    if (!user.warehouse) {
      throw new BadRequestException(
        'El usuario LOGISTICS no tiene una unidad asignada.',
      );
    }

    if (request.warehouse.id !== user.warehouse.id) {
      throw new ForbiddenException(
        'Solo puedes generar Guías de Remisión para requerimientos de tu propia unidad.',
      );
    }
  }

  // ============================================================
  // ALCANCE DE LA GUÍA
  //
  // LOGISTICS puede participar como:
  //
  // ORIGEN
  // o
  // DESTINO
  //
  // Esto permite:
  //
  // Lima -> Mina
  // Mina -> Lima
  // Mina -> Mina
  // Mina -> Externo
  // ============================================================

  private validateGuideScope(
    user: User,
    sourceWarehouse: Warehouse,
    destinationWarehouse: Warehouse,
  ): void {
    if (this.isAdmin(user)) {
      return;
    }

    if (!user.warehouse) {
      throw new ForbiddenException(
        'El usuario LOGISTICS no tiene una unidad asignada.',
      );
    }

    const warehouseId = user.warehouse.id;

    const participates =
      sourceWarehouse.id === warehouseId ||
      destinationWarehouse.id === warehouseId;

    if (!participates) {
      throw new ForbiddenException(
        'Esta Guía de Remisión no pertenece a tu unidad.',
      );
    }
  }

  // ============================================================
  // ESTADO DEL REQUERIMIENTO
  // ============================================================

  private validateRequestStatus(request: Request): void {
    const allowedStatuses: RequestStatus[] = [
      RequestStatus.APPROVED,
      RequestStatus.PARTIAL,
      RequestStatus.IN_PROGRESS,
    ];

    if (!allowedStatuses.includes(request.status)) {
      throw new BadRequestException(
        `El requerimiento ${request.requestNumber} no está disponible para despacho.`,
      );
    }
  }

  // ============================================================
  // APROBADO
  // ============================================================

  private getApprovedQuantity(detail: RequestDetail): number {
    const approved = Number(detail.approvedQuantity);

    if (Number.isFinite(approved) && approved > 0) {
      return approved;
    }

    return Number(detail.quantity);
  }

  // ============================================================
  // DESPACHADO
  // ============================================================

  private getDeliveredQuantity(detail: RequestDetail): number {
    return Number(detail.deliveredQuantity ?? 0);
  }

  // ============================================================
  // PENDIENTE
  // ============================================================

  private getPendingQuantity(detail: RequestDetail): number {
    return Math.max(
      0,
      this.getApprovedQuantity(detail) - this.getDeliveredQuantity(detail),
    );
  }

  // ============================================================
  // ÚLTIMA COMPRA
  // ============================================================

  private async getLatestPurchaseValuation(
    manager: EntityManager,
    productId: number,
  ): Promise<{
    unitCost: number;
    currency: 'PEN' | 'USD';
  } | null> {
    const latestPurchaseDetail = await manager
      .getRepository(PurchaseDetail)
      .createQueryBuilder('purchaseDetail')
      .innerJoinAndSelect('purchaseDetail.purchase', 'purchase')
      .innerJoin('purchaseDetail.product', 'purchaseProduct')
      .where('purchaseProduct.id = :productId', {
        productId,
      })
      .orderBy('purchase.purchaseDate', 'DESC')
      .addOrderBy('purchase.id', 'DESC')
      .addOrderBy('purchaseDetail.id', 'DESC')
      .getOne();

    if (!latestPurchaseDetail) {
      return null;
    }

    const unitCost = Number(latestPurchaseDetail.unitPrice);

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      return null;
    }

    const currency = latestPurchaseDetail.purchase?.currency;

    if (
      currency !== PurchaseCurrency.PEN &&
      currency !== PurchaseCurrency.USD
    ) {
      return null;
    }

    return {
      unitCost: Number(unitCost.toFixed(4)),
      currency,
    };
  }

  // ============================================================
  // VALORIZACIÓN
  // ============================================================

  private async getDispatchValuation(
    manager: EntityManager,
    productId: number,
    sourceWarehouseId: number,
  ): Promise<{
    unitCost: number;
    currency: 'PEN' | 'USD';
  } | null> {
    const inventoryValuation =
      await this.stockMovementsService.getLatestInventoryValuation(
        manager,
        productId,
        sourceWarehouseId,
      );

    if (inventoryValuation) {
      return inventoryValuation;
    }

    return this.getLatestPurchaseValuation(manager, productId);
  }

  // ============================================================
  // CORRELATIVO
  //
  // Cada serie tiene su propia numeración.
  //
  // 002 -> 000001, 000002...
  // 003 -> 000001, 000002...
  // 004 -> 000001, 000002...
  // ============================================================

  private async generateGuideNumber(
    manager: EntityManager,
    series: string,
  ): Promise<{
    guideNumber: string;
    fullNumber: string;
  }> {
    const normalizedSeries = series.trim().padStart(3, '0');

    const lastGuide = await manager
      .getRepository(RemissionGuide)
      .createQueryBuilder('guide')
      .where('guide.series = :series', {
        series: normalizedSeries,
      })
      .orderBy('guide.id', 'DESC')
      .getOne();

    let nextNumber = 1;

    if (lastGuide?.guideNumber) {
      const lastNumber = Number(lastGuide.guideNumber);

      if (Number.isFinite(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const guideNumber = String(nextNumber).padStart(6, '0');

    return {
      guideNumber,
      fullNumber: `${normalizedSeries}-${guideNumber}`,
    };
  }
  // ============================================================
  // CREAR GUÍA
  // ============================================================

  async create(
    dto: CreateRemissionGuideDto,
    userId: number,
  ): Promise<RemissionGuide> {
    let createdGuideId = 0;

    await this.dataSource.transaction(async (manager) => {
      const user = await this.getUser(userId, manager);

      this.validateCanManage(user);

      // ======================================================
      // AQUÍ ESTÁ EL CAMBIO PRINCIPAL
      //
      // ADMIN    -> Lima
      // LOGISTICS -> su propia mina/unidad
      // ======================================================

      const sourceWarehouse = await this.getSourceWarehouse(user, manager);

      // ======================================================
      // CENTRAL
      //
      // Solo se usa para determinar la serie de Lima.
      // ======================================================

      const centralWarehouse = await this.getCentralWarehouse(manager);

      // ======================================================
      // SERIE AUTOMÁTICA
      // ======================================================

      const series = this.getGuideSeries(sourceWarehouse);

      let request: Request | null = null;

      let destinationWarehouse: Warehouse | null = null;

      // ======================================================
      // REQUEST
      // ======================================================

      if (dto.guideType === RemissionGuideType.REQUEST) {
        if (!dto.requestId) {
          throw new BadRequestException(
            'Debe seleccionar un requerimiento para este tipo de guía.',
          );
        }

        request = await manager.findOne(Request, {
          where: {
            id: dto.requestId,
          },

          relations: {
            warehouse: true,

            details: {
              product: true,
            },
          },
        });

        if (!request) {
          throw new NotFoundException('Requerimiento no encontrado.');
        }

        this.validateRequestStatus(request);

        this.validateRequestScope(user, request);

        destinationWarehouse = request.warehouse;

        if (sourceWarehouse.id === destinationWarehouse.id) {
          throw new BadRequestException(
            'El almacén de origen y destino no pueden ser el mismo.',
          );
        }

        this.validateGuideScope(user, sourceWarehouse, destinationWarehouse);
      }

      // ======================================================
      // MANUAL_WAREHOUSE
      // ======================================================

      if (dto.guideType === RemissionGuideType.MANUAL_WAREHOUSE) {
        if (!dto.destinationWarehouseId) {
          throw new BadRequestException(
            'Debe seleccionar la mina o almacén de destino.',
          );
        }

        destinationWarehouse = await manager.findOne(Warehouse, {
          where: {
            id: dto.destinationWarehouseId,
          },
        });

        if (!destinationWarehouse) {
          throw new NotFoundException(
            'Mina o almacén de destino no encontrado.',
          );
        }

        if (!destinationWarehouse.isActive) {
          throw new BadRequestException(
            'La mina o almacén de destino se encuentra inactivo.',
          );
        }

        if (sourceWarehouse.id === destinationWarehouse.id) {
          throw new BadRequestException(
            'El almacén de origen y destino no pueden ser el mismo.',
          );
        }

        this.validateGuideScope(user, sourceWarehouse, destinationWarehouse);
      }

      // ======================================================
      // EXTERNAL_SERVICE
      // ======================================================

      if (dto.guideType === RemissionGuideType.EXTERNAL_SERVICE) {
        if (!dto.recipientName?.trim()) {
          throw new BadRequestException(
            'Debe indicar el proveedor, taller o destinatario externo.',
          );
        }

        if (!dto.arrivalPoint?.trim()) {
          throw new BadRequestException(
            'Debe indicar el punto de llegada del servicio externo.',
          );
        }

        // ==================================================
        // YA NO EXISTE LA RESTRICCIÓN:
        //
        // "Solo Lima puede enviar a externo"
        //
        // Cualquier LOGISTICS puede hacerlo desde
        // su propio almacén.
        // ==================================================
      }

      // ======================================================
      // VALIDAR TIPO
      // ======================================================

      if (
        dto.guideType !== RemissionGuideType.REQUEST &&
        dto.guideType !== RemissionGuideType.MANUAL_WAREHOUSE &&
        dto.guideType !== RemissionGuideType.EXTERNAL_SERVICE
      ) {
        throw new BadRequestException(
          'El tipo de Guía de Remisión no es válido.',
        );
      }

      // ======================================================
      // DETALLES
      // ======================================================

      if (!dto.details || dto.details.length === 0) {
        throw new BadRequestException(
          'La Guía de Remisión debe contener al menos un producto.',
        );
      }

      // ======================================================
      // REQUEST
      // ======================================================

      if (dto.guideType === RemissionGuideType.REQUEST) {
        const requestDetailIds = dto.details.map(
          (detail) => detail.requestDetailId,
        );

        if (requestDetailIds.some((id) => !id)) {
          throw new BadRequestException(
            'Todos los productos de una guía por requerimiento deben indicar requestDetailId.',
          );
        }

        if (new Set(requestDetailIds).size !== requestDetailIds.length) {
          throw new BadRequestException(
            'No se puede repetir un detalle del requerimiento en la guía.',
          );
        }
      }

      // ======================================================
      // MANUAL
      // ======================================================

      if (dto.guideType === RemissionGuideType.MANUAL_WAREHOUSE) {
        const productIds = dto.details.map((detail) => detail.productId);

        if (productIds.some((id) => !id)) {
          throw new BadRequestException(
            'Todos los productos de una guía manual a mina deben estar registrados.',
          );
        }

        if (new Set(productIds).size !== productIds.length) {
          throw new BadRequestException(
            'No se puede repetir un producto dentro de la misma guía.',
          );
        }
      }

      // ======================================================
      // CORRELATIVO
      // ======================================================

      const { guideNumber, fullNumber } = await this.generateGuideNumber(
        manager,
        series,
      );

      // ======================================================
      // DOCUMENTACIÓN
      // ======================================================

      const arrivalPoint =
        dto.guideType === RemissionGuideType.EXTERNAL_SERVICE
          ? dto.arrivalPoint!.trim()
          : destinationWarehouse?.address || destinationWarehouse?.name || '';

      const recipientName =
        dto.guideType === RemissionGuideType.REQUEST
          ? request!.requester
          : dto.guideType === RemissionGuideType.MANUAL_WAREHOUSE
            ? destinationWarehouse!.name
            : dto.recipientName!.trim();

      const recipientRuc =
        dto.guideType === RemissionGuideType.EXTERNAL_SERVICE
          ? dto.recipientRuc?.trim() || null
          : null;

      // ======================================================
      // CREAR GUÍA
      // ======================================================

      const guide = manager.create(RemissionGuide, {
        guideType: dto.guideType,

        // Serie calculada por backend
        series,

        guideNumber,

        fullNumber,

        request,

        // ORIGEN REAL
        sourceWarehouse,

        destinationWarehouse,

        issueDate: dto.issueDate ?? new Date().toISOString().slice(0, 10),

        transferStartDate: dto.transferStartDate,

        // Sale del almacén real
        departurePoint: sourceWarehouse.address || sourceWarehouse.name,

        arrivalPoint,

        recipientName,

        recipientRuc,

        purchaseOrderReference: dto.purchaseOrderReference?.trim() || null,

        minimumCost: dto.minimumCost ?? null,

        vehicleBrand: dto.vehicleBrand?.trim() || null,

        vehiclePlate: dto.vehiclePlate?.trim().toUpperCase() || null,

        registrationCertificate: dto.registrationCertificate?.trim() || null,

        driverLicense: dto.driverLicense?.trim().toUpperCase() || null,

        transportCompanyName: dto.transportCompanyName?.trim() || null,

        transportCompanyRuc: dto.transportCompanyRuc?.trim() || null,

        transferReason: dto.transferReason,

        otherTransferReason: dto.otherTransferReason?.trim() || null,

        observations: dto.observations?.trim() || null,

        status: RemissionGuideStatus.ISSUED,

        createdBy: user,

        details: [],
      });

      const savedGuide = await manager.save(RemissionGuide, guide);

      const savedDetails: RemissionGuideDetail[] = [];

      // ======================================================
      // PROCESAR DETALLES
      // ======================================================

      for (const item of dto.details) {
        const quantity = Number(item.quantity);

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new BadRequestException(
            'La cantidad de cada producto debe ser mayor a cero.',
          );
        }

        let totalWeight: number | null = null;

        if (item.totalWeight !== undefined && item.totalWeight !== null) {
          const weight = Number(item.totalWeight);

          if (!Number.isFinite(weight) || weight < 0) {
            throw new BadRequestException(
              'El peso total indicado no es válido.',
            );
          }

          totalWeight = weight;
        }

        let requestDetail: RequestDetail | null = null;

        let product: Product | null = null;

        let description: string | null = null;

        let unit: string | null = null;

        // ====================================================
        // REQUEST
        // ====================================================

        if (dto.guideType === RemissionGuideType.REQUEST) {
          requestDetail =
            request!.details.find(
              (detail) => detail.id === item.requestDetailId,
            ) ?? null;

          if (!requestDetail) {
            throw new BadRequestException(
              `El detalle ${item.requestDetailId} no pertenece al requerimiento ${request!.requestNumber}.`,
            );
          }

          const pendingQuantity = this.getPendingQuantity(requestDetail);

          if (pendingQuantity <= 0) {
            throw new BadRequestException(
              `"${requestDetail.product.name}" ya fue despachado completamente.`,
            );
          }

          if (quantity > pendingQuantity) {
            throw new BadRequestException(
              `La cantidad de "${requestDetail.product.name}" supera el pendiente por despachar (${pendingQuantity}).`,
            );
          }

          product = requestDetail.product;

          description = requestDetail.product.name;

          unit = String(requestDetail.product.unit);
        }

        // ====================================================
        // MANUAL
        // ====================================================

        if (dto.guideType === RemissionGuideType.MANUAL_WAREHOUSE) {
          product = await manager.findOne(Product, {
            where: {
              id: item.productId!,
            },
          });

          if (!product) {
            throw new NotFoundException(
              `Producto con ID ${item.productId} no encontrado.`,
            );
          }

          if (!product.isActive) {
            throw new BadRequestException(
              `El producto "${product.name}" se encuentra inactivo.`,
            );
          }

          description = product.name;

          unit = String(product.unit);
        }

        // ====================================================
        // EXTERNAL SERVICE
        // ====================================================

        if (dto.guideType === RemissionGuideType.EXTERNAL_SERVICE) {
          if (item.productId) {
            product = await manager.findOne(Product, {
              where: {
                id: item.productId,
              },
            });

            if (!product) {
              throw new NotFoundException(
                `Producto con ID ${item.productId} no encontrado.`,
              );
            }

            description = item.description?.trim() || product.name;

            unit = item.unit?.trim() || String(product.unit);
          } else {
            description = item.description?.trim() || null;

            unit = item.unit?.trim() || null;

            if (!description) {
              throw new BadRequestException(
                'Un producto no registrado debe tener una descripción.',
              );
            }
          }
        }

        // ====================================================
        // VALORIZACIÓN
        //
        // MUY IMPORTANTE:
        // ahora utiliza el almacén REAL de origen.
        // ====================================================

        const valuation = product
          ? await this.getDispatchValuation(
              manager,
              product.id,
              sourceWarehouse.id,
            )
          : null;

        const unitCost = valuation?.unitCost ?? null;

        const currency = valuation?.currency ?? null;

        const totalCost =
          unitCost !== null ? Number((quantity * unitCost).toFixed(2)) : null;

        // ====================================================
        // DETALLE
        // ====================================================

        const guideDetail = manager.create(RemissionGuideDetail, {
          guide: savedGuide,

          requestDetail,

          product,

          description,

          unit,

          quantity,

          unitCost,

          totalCost,

          currency,

          totalWeight,
        });

        const savedDetail = await manager.save(
          RemissionGuideDetail,
          guideDetail,
        );

        savedDetails.push(savedDetail);

        // ====================================================
        // INVENTARIO
        //
        // Mina -> Lima
        // Mina -> Mina
        // Lima -> Mina
        //
        // Se utiliza sourceWarehouse real.
        // ====================================================

        if (
          dto.guideType === RemissionGuideType.REQUEST ||
          dto.guideType === RemissionGuideType.MANUAL_WAREHOUSE
        ) {
          await this.stockMovementsService.processMovementWithManager(
            manager,
            {
              movementType: MovementType.TRANSFER,

              productId: product!.id,

              quantity,

              unitCost: unitCost ?? undefined,

              currency: currency ?? undefined,

              sourceWarehouseId: sourceWarehouse.id,

              destinationWarehouseId: destinationWarehouse!.id,

              reason: `Guía de Remisión ${fullNumber}`,

              reference: fullNumber,
            },
            userId,
          );
        }

        // ====================================================
        // ACTUALIZAR REQUERIMIENTO
        // ====================================================

        if (dto.guideType === RemissionGuideType.REQUEST && requestDetail) {
          const currentDelivered = this.getDeliveredQuantity(requestDetail);

          requestDetail.deliveredQuantity = currentDelivered + quantity;

          await manager.save(RequestDetail, requestDetail);
        }
      }

      // ======================================================
      // ESTADO DEL REQUERIMIENTO
      // ======================================================

      if (dto.guideType === RemissionGuideType.REQUEST && request) {
        let allDelivered = true;

        let someDelivered = false;

        for (const detail of request.details) {
          const approved = this.getApprovedQuantity(detail);

          const delivered = this.getDeliveredQuantity(detail);

          if (delivered > 0) {
            someDelivered = true;
          }

          if (delivered < approved) {
            allDelivered = false;
          }
        }

        if (allDelivered) {
          request.status = RequestStatus.DELIVERED;
        } else if (someDelivered) {
          request.status = RequestStatus.IN_PROGRESS;
        } else {
          request.status = RequestStatus.APPROVED;
        }

        await manager.save(Request, request);
      }

      savedGuide.details = savedDetails;

      createdGuideId = savedGuide.id;
    });

    return this.findOne(createdGuideId, userId);
  }

  // ============================================================
  // LISTAR
  // ============================================================

  async findAll(userId: number): Promise<RemissionGuide[]> {
    const user = await this.getUser(userId);

    this.validateCanManage(user);

    const query = this.remissionGuideRepository
      .createQueryBuilder('guide')
      .leftJoinAndSelect('guide.request', 'request')
      .leftJoinAndSelect('request.warehouse', 'requestWarehouse')
      .leftJoinAndSelect('guide.sourceWarehouse', 'sourceWarehouse')
      .leftJoinAndSelect('guide.destinationWarehouse', 'destinationWarehouse')
      .leftJoinAndSelect('guide.createdBy', 'createdBy')
      .leftJoinAndSelect('guide.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('details.requestDetail', 'requestDetail');

    // ==========================================================
    // LOGISTICS:
    // solo ve guías donde participa su unidad.
    // ==========================================================

    if (this.isLogistics(user)) {
      if (!user.warehouse) {
        return [];
      }

      query.andWhere(
        `(
          sourceWarehouse.id = :warehouseId
          OR destinationWarehouse.id = :warehouseId
        )`,
        {
          warehouseId: user.warehouse.id,
        },
      );
    }

    query.orderBy('guide.createdAt', 'DESC');

    return query.getMany();
  }

  // ============================================================
  // OBTENER UNA
  // ============================================================

  async findOne(id: number, userId: number): Promise<RemissionGuide> {
    const user = await this.getUser(userId);

    this.validateCanManage(user);

    const guide = await this.remissionGuideRepository.findOne({
      where: {
        id,
      },

      relations: {
        request: {
          warehouse: true,
        },

        sourceWarehouse: true,

        destinationWarehouse: true,

        createdBy: true,

        details: {
          product: {
            category: true,
          },

          requestDetail: true,
        },
      },
    });

    if (!guide) {
      throw new NotFoundException('Guía de Remisión no encontrada.');
    }

    // ==========================================================
    // LOGISTICS SOLO PUEDE VER GUÍAS DE SU UNIDAD
    // ==========================================================

    if (this.isLogistics(user)) {
      if (!user.warehouse) {
        throw new NotFoundException('Guía de Remisión no encontrada.');
      }

      const warehouseId = user.warehouse.id;

      const belongsToUser =
        guide.sourceWarehouse.id === warehouseId ||
        guide.destinationWarehouse?.id === warehouseId;

      if (!belongsToUser) {
        throw new NotFoundException('Guía de Remisión no encontrada.');
      }
    }

    return guide;
  }
}
