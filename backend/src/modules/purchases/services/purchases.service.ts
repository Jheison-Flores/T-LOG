import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, Repository } from 'typeorm';

import { Purchase } from '../entities/purchase.entity';

import { PurchaseDetail } from '../entities/purchase-detail.entity';

import { PurchaseStatus } from '../entities/purchase-status.enum';

import { Product } from '../../products/entities/product.entity';

import { Supplier } from '../../suppliers/entities/supplier.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { User } from '../../users/entities/user.entity';

import { Request } from '../../requests/entities/request.entity';

import { RequestStatus } from '../../requests/entities/request-status.enum';

import { CreatePurchaseDto } from '../dto/create-purchase.dto';

import { UpdatePurchaseDto } from '../dto/update-purchase.dto';

import { ReceivePurchaseDto } from '../dto/receive-purchase.dto';

import { StockMovementsService } from '../../stock-movements/services/stock.movements.service';

import { MovementType } from '../../stock-movements/entities/movement-type.enum';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,

    @InjectRepository(PurchaseDetail)
    private readonly purchaseDetailRepository: Repository<PurchaseDetail>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    private readonly stockMovementsService: StockMovementsService,

    private readonly dataSource: DataSource,
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
  // PERMISO GENERAL
  //
  // ADMIN y LOGISTICS pueden gestionar O.C.
  // ============================================================

  private validateCanManage(user: User): void {
    if (!this.isAdmin(user) && !this.isLogistics(user)) {
      throw new ForbiddenException(
        'No tienes permisos para gestionar Órdenes de Compra.',
      );
    }

    if (this.isLogistics(user) && !user.warehouse) {
      throw new BadRequestException(
        'El usuario LOGISTICS no tiene una unidad o almacén asignado.',
      );
    }
  }

  // ============================================================
  // RESOLVER UNIDAD
  //
  // ADMIN:
  // selecciona warehouse.
  //
  // LOGISTICS:
  // obligatoriamente utiliza su propio warehouse.
  // ============================================================

  private async resolveWarehouse(
    user: User,
    warehouseId?: number,
    manager?: EntityManager,
  ): Promise<Warehouse> {
    if (this.isLogistics(user)) {
      if (!user.warehouse) {
        throw new BadRequestException(
          'El usuario LOGISTICS no tiene una unidad asignada.',
        );
      }

      return user.warehouse;
    }

    if (this.isAdmin(user)) {
      if (!warehouseId) {
        throw new BadRequestException(
          'Debe seleccionar la unidad de la Orden de Compra.',
        );
      }

      const repository = manager
        ? manager.getRepository(Warehouse)
        : this.warehouseRepository;

      const warehouse = await repository.findOne({
        where: {
          id: warehouseId,
        },
      });

      if (!warehouse) {
        throw new NotFoundException('Unidad o almacén no encontrado.');
      }

      return warehouse;
    }

    throw new ForbiddenException(
      'No tienes permisos para gestionar Órdenes de Compra.',
    );
  }

  // ============================================================
  // PROVEEDOR GLOBAL
  //
  // NO se filtra por warehouse.
  // ============================================================

  private async getValidSupplier(
    supplierId: number,
    manager?: EntityManager,
  ): Promise<Supplier> {
    const repository = manager
      ? manager.getRepository(Supplier)
      : this.supplierRepository;

    const supplier = await repository.findOne({
      where: {
        id: supplierId,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado.');
    }

    if (!supplier.isActive) {
      throw new BadRequestException(
        'El proveedor seleccionado se encuentra inactivo.',
      );
    }

    return supplier;
  }

  // ============================================================
  // GENERAR NÚMERO DE O.C.
  // ============================================================

  private async generatePurchaseOrderNumber(
    manager: EntityManager,
  ): Promise<string> {
    const year = new Date().getFullYear();

    const lastPurchase = await manager
      .getRepository(Purchase)
      .createQueryBuilder('purchase')
      .orderBy('purchase.id', 'DESC')
      .getOne();

    const nextNumber = lastPurchase ? lastPurchase.id + 1 : 1;

    return `OC-${year}-${String(nextNumber).padStart(6, '0')}`;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(dto: CreatePurchaseDto, userId: number): Promise<Purchase> {
    let createdPurchaseId = 0;

    await this.dataSource.transaction(async (manager) => {
      // ======================================================
      // USUARIO
      // ======================================================

      const user = await this.getUser(userId, manager);

      this.validateCanManage(user);

      // ======================================================
      // UNIDAD
      //
      // LOGISTICS:
      // automáticamente su unidad.
      //
      // ADMIN:
      // seleccionada desde frontend.
      // ======================================================

      const warehouse = await this.resolveWarehouse(
        user,
        dto.warehouseId,
        manager,
      );

      // ======================================================
      // PROVEEDOR GLOBAL
      // ======================================================

      const supplier = await this.getValidSupplier(dto.supplierId, manager);

      // ======================================================
      // REQUERIMIENTO OPCIONAL
      // ======================================================

      let request: Request | null = null;

      if (dto.requestId) {
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

        if (request.warehouse.id !== warehouse.id) {
          throw new BadRequestException(
            'El requerimiento seleccionado pertenece a otra unidad.',
          );
        }

        const allowedStatuses: RequestStatus[] = [
          RequestStatus.APPROVED,
          RequestStatus.PARTIAL,
        ];

        if (!allowedStatuses.includes(request.status)) {
          throw new BadRequestException(
            'Solo pueden utilizarse requerimientos aprobados o parciales para generar una Orden de Compra.',
          );
        }
      }

      // ======================================================
      // VALIDAR DETALLES
      // ======================================================

      if (!dto.details || dto.details.length === 0) {
        throw new BadRequestException(
          'La Orden de Compra debe contener al menos un producto.',
        );
      }

      const productIds = dto.details.map((detail) => detail.productId);

      if (new Set(productIds).size !== productIds.length) {
        throw new BadRequestException(
          'No se puede repetir un producto dentro de la misma Orden de Compra.',
        );
      }

      // ======================================================
      // CABECERA
      // ======================================================

      const purchaseOrderNumber =
        await this.generatePurchaseOrderNumber(manager);

      const purchase = manager.create(Purchase, {
        purchaseOrderNumber,

        warehouse,

        supplier,

        request,

        purchaseDate: dto.purchaseDate ?? new Date().toISOString().slice(0, 10),

        quotationNumber: dto.quotationNumber?.trim() || null,

        currency: dto.currency,

        applyIgv: dto.applyIgv ?? true,

        commercialConditions: dto.commercialConditions?.trim() || null,

        paymentMethod: dto.paymentMethod?.trim() || null,

        observation: dto.observation?.trim() || null,

        subtotalAmount: 0,

        igvAmount: 0,

        totalAmount: 0,

        status: PurchaseStatus.REGISTERED,

        createdBy: user,

        details: [],
      });

      const savedPurchase = await manager.save(Purchase, purchase);

      // ======================================================
      // DETALLES
      // ======================================================

      const details: PurchaseDetail[] = [];

      let subtotal = 0;

      for (const item of dto.details) {
        const product = await manager.findOne(Product, {
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${item.productId} no encontrado.`,
          );
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `El producto "${product.name}" está inactivo.`,
          );
        }

        const quantity = Number(item.quantity);

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new BadRequestException(
            `La cantidad del producto "${product.name}" debe ser mayor a cero.`,
          );
        }

        const unitPrice = Number(item.unitPrice);

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new BadRequestException(
            `El precio unitario del producto "${product.name}" no es válido.`,
          );
        }

        // ====================================================
        // SI VIENE DE REQUERIMIENTO
        // ====================================================

        if (request) {
          const requestDetail = request.details.find(
            (detail) => detail.product.id === product.id,
          );

          if (!requestDetail) {
            throw new BadRequestException(
              `El producto "${product.name}" no pertenece al requerimiento seleccionado.`,
            );
          }

          const approvedQuantity = Number(
            requestDetail.approvedQuantity ?? requestDetail.quantity,
          );

          if (quantity > approvedQuantity) {
            throw new BadRequestException(
              `La cantidad de "${product.name}" supera la cantidad aprobada (${approvedQuantity}).`,
            );
          }
        }

        const lineSubtotal = quantity * unitPrice;

        subtotal += lineSubtotal;

        const detail = manager.create(PurchaseDetail, {
          purchase: savedPurchase,

          product,

          quantity,

          unitPrice,

          subtotal: Number(lineSubtotal.toFixed(2)),
        });

        details.push(detail);
      }

      const savedDetails = await manager.save(PurchaseDetail, details);

      // ======================================================
      // IMPORTANTE
      //
      // La cabecera se creó inicialmente con details: [].
      // Antes de volver a guardar Purchase para actualizar los
      // totales, sincronizamos la relación con los detalles
      // recién creados. De esta forma TypeORM conserva los
      // productos asociados a la O.C. y estos quedan disponibles
      // para detalle, recepción y exportaciones.
      // ======================================================

      savedPurchase.details = savedDetails;

      // ======================================================
      // TOTALES
      // ======================================================

      const applyIgv = dto.applyIgv ?? true;

      const igvAmount = applyIgv ? subtotal * 0.18 : 0;

      const totalAmount = subtotal + igvAmount;

      savedPurchase.subtotalAmount = Number(subtotal.toFixed(2));

      savedPurchase.igvAmount = Number(igvAmount.toFixed(2));

      savedPurchase.totalAmount = Number(totalAmount.toFixed(2));

      await manager.save(Purchase, savedPurchase);

      createdPurchaseId = savedPurchase.id;
    });

    return this.findOne(createdPurchaseId, userId);
  }

  // ============================================================
  // LISTAR
  //
  // ADMIN:
  // ve todas.
  //
  // LOGISTICS:
  // ve exclusivamente las de su warehouse.
  // ============================================================

  async findAll(userId: number): Promise<Purchase[]> {
    const user = await this.getUser(userId);

    this.validateCanManage(user);

    const query = this.purchaseRepository
      .createQueryBuilder('purchase')

      .leftJoinAndSelect('purchase.warehouse', 'warehouse')

      .leftJoinAndSelect('purchase.supplier', 'supplier')

      .leftJoinAndSelect('purchase.request', 'request')

      .leftJoinAndSelect('request.warehouse', 'requestWarehouse')

      .leftJoinAndSelect('purchase.details', 'details')

      .leftJoinAndSelect('details.product', 'product')

      .leftJoinAndSelect('product.category', 'category')

      .leftJoinAndSelect('purchase.createdBy', 'createdBy')

      .leftJoinAndSelect('purchase.receivedWarehouse', 'receivedWarehouse')

      .leftJoinAndSelect('purchase.receivedBy', 'receivedBy');

    if (this.isLogistics(user)) {
      if (!user.warehouse) {
        return [];
      }

      query.andWhere('warehouse.id = :warehouseId', {
        warehouseId: user.warehouse.id,
      });
    }

    query.orderBy('purchase.createdAt', 'DESC');

    return query.getMany();
  }

  // ============================================================
  // OBTENER UNA
  //
  // userId OPCIONAL:
  //
  // findOne(id)
  // → uso interno del exportador.
  //
  // findOne(id, userId)
  // → valida alcance del usuario.
  //
  // Esto corrige los errores de PurchaseExportService.
  // ============================================================

  async findOne(id: number, userId?: number): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: {
        id,
      },

      relations: {
        warehouse: true,

        supplier: true,

        request: {
          warehouse: true,
        },

        details: {
          product: {
            category: true,
          },
        },

        createdBy: true,

        receivedWarehouse: true,

        receivedBy: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Orden de Compra no encontrada.');
    }

    // ==========================================================
    // USO INTERNO
    // ==========================================================

    if (userId === undefined) {
      return purchase;
    }

    // ==========================================================
    // USUARIO
    // ==========================================================

    const user = await this.getUser(userId);

    this.validateCanManage(user);

    // ==========================================================
    // LOGISTICS SOLO SU UNIDAD
    // ==========================================================

    if (this.isLogistics(user)) {
      if (
        !user.warehouse ||
        !purchase.warehouse ||
        purchase.warehouse.id !== user.warehouse.id
      ) {
        throw new NotFoundException('Orden de Compra no encontrada.');
      }
    }

    return purchase;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    dto: UpdatePurchaseDto,
    userId: number,
  ): Promise<Purchase> {
    const user = await this.getUser(userId);

    this.validateCanManage(user);

    const purchase = await this.findOne(id, userId);

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException(
        'Una Orden de Compra recibida ya no puede modificarse.',
      );
    }

    // ==========================================================
    // UNIDAD
    // ==========================================================

    let warehouse: Warehouse | null | undefined = purchase.warehouse;

    if (this.isLogistics(user)) {
      warehouse = user.warehouse;
    }

    if (this.isAdmin(user) && dto.warehouseId !== undefined) {
      warehouse = await this.resolveWarehouse(user, dto.warehouseId);
    }

    if (!warehouse) {
      throw new BadRequestException(
        'La Orden de Compra debe estar asociada a una unidad.',
      );
    }

    purchase.warehouse = warehouse;

    // ==========================================================
    // PROVEEDOR GLOBAL
    // ==========================================================

    if (dto.supplierId !== undefined) {
      purchase.supplier = await this.getValidSupplier(dto.supplierId);
    }

    // ==========================================================
    // REQUERIMIENTO
    // ==========================================================

    if (dto.requestId !== undefined) {
      const request = await this.requestRepository.findOne({
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

      if (request.warehouse.id !== warehouse.id) {
        throw new BadRequestException(
          'El requerimiento seleccionado pertenece a otra unidad.',
        );
      }

      purchase.request = request;
    }

    // ==========================================================
    // CAMPOS SIMPLES
    // ==========================================================

    if (dto.purchaseDate !== undefined) {
      purchase.purchaseDate = dto.purchaseDate || null;
    }

    if (dto.quotationNumber !== undefined) {
      purchase.quotationNumber = dto.quotationNumber?.trim() || null;
    }

    if (dto.currency !== undefined) {
      purchase.currency = dto.currency;
    }

    if (dto.applyIgv !== undefined) {
      purchase.applyIgv = dto.applyIgv;
    }

    if (dto.commercialConditions !== undefined) {
      purchase.commercialConditions = dto.commercialConditions?.trim() || null;
    }

    if (dto.paymentMethod !== undefined) {
      purchase.paymentMethod = dto.paymentMethod?.trim() || null;
    }

    if (dto.observation !== undefined) {
      purchase.observation = dto.observation?.trim() || null;
    }

    // ==========================================================
    // DETALLES
    // ==========================================================

    if (dto.details !== undefined) {
      if (dto.details.length === 0) {
        throw new BadRequestException(
          'La Orden de Compra debe contener al menos un producto.',
        );
      }

      const productIds = dto.details.map((detail) => detail.productId);

      if (new Set(productIds).size !== productIds.length) {
        throw new BadRequestException(
          'No se puede repetir un producto en la Orden de Compra.',
        );
      }

      // ========================================================
      // ELIMINAR DETALLES VIEJOS
      // ========================================================

      await this.purchaseDetailRepository
        .createQueryBuilder()
        .delete()
        .from(PurchaseDetail)
        .where('purchase_id = :purchaseId', {
          purchaseId: purchase.id,
        })
        .execute();

      const newDetails: PurchaseDetail[] = [];

      let subtotal = 0;

      for (const item of dto.details) {
        const product = await this.productRepository.findOne({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${item.productId} no encontrado.`,
          );
        }

        const quantity = Number(item.quantity);

        const unitPrice = Number(item.unitPrice);

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new BadRequestException(
            `La cantidad de "${product.name}" debe ser mayor a cero.`,
          );
        }

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new BadRequestException(
            `El precio de "${product.name}" no es válido.`,
          );
        }

        // ======================================================
        // VALIDAR CONTRA REQUERIMIENTO
        // ======================================================

        if (purchase.request) {
          const request = await this.requestRepository.findOne({
            where: {
              id: purchase.request.id,
            },

            relations: {
              details: {
                product: true,
              },
            },
          });

          if (!request) {
            throw new NotFoundException(
              'Requerimiento asociado no encontrado.',
            );
          }

          const requestDetail = request.details.find(
            (detail) => detail.product.id === product.id,
          );

          if (!requestDetail) {
            throw new BadRequestException(
              `El producto "${product.name}" no pertenece al requerimiento asociado.`,
            );
          }

          const approvedQuantity = Number(
            requestDetail.approvedQuantity ?? requestDetail.quantity,
          );

          if (quantity > approvedQuantity) {
            throw new BadRequestException(
              `La cantidad de "${product.name}" supera la cantidad aprobada (${approvedQuantity}).`,
            );
          }
        }

        const lineSubtotal = quantity * unitPrice;

        subtotal += lineSubtotal;

        const detail = this.purchaseDetailRepository.create({
          purchase,

          product,

          quantity,

          unitPrice,

          subtotal: Number(lineSubtotal.toFixed(2)),
        });

        newDetails.push(detail);
      }

      const savedNewDetails =
        await this.purchaseDetailRepository.save(newDetails);

      // ========================================================
      // SINCRONIZAR RELACIÓN
      //
      // Evita que al guardar nuevamente Purchase permanezca en
      // memoria la colección anterior de detalles.
      // ========================================================

      purchase.details = savedNewDetails;

      const igv = purchase.applyIgv ? subtotal * 0.18 : 0;

      purchase.subtotalAmount = Number(subtotal.toFixed(2));

      purchase.igvAmount = Number(igv.toFixed(2));

      purchase.totalAmount = Number((subtotal + igv).toFixed(2));
    } else if (dto.applyIgv !== undefined) {
      // ========================================================
      // SOLO CAMBIÓ EL IGV
      // ========================================================

      const subtotal = Number(purchase.subtotalAmount ?? 0);

      const igv = purchase.applyIgv ? subtotal * 0.18 : 0;

      purchase.igvAmount = Number(igv.toFixed(2));

      purchase.totalAmount = Number((subtotal + igv).toFixed(2));
    }

    await this.purchaseRepository.save(purchase);

    return this.findOne(purchase.id, userId);
  }

  // ============================================================
  // RECEPCIONAR
  // ============================================================

  async receive(
    id: number,
    dto: ReceivePurchaseDto,
    userId: number,
  ): Promise<Purchase> {
    const user = await this.getUser(userId);

    this.validateCanManage(user);

    const purchase = await this.findOne(id, userId);

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('La Orden de Compra ya fue recepcionada.');
    }

    // ==========================================================
    // IMPORTANTE:
    // explícitamente number | undefined.
    //
    // Corrige TS2322.
    // ==========================================================

    let warehouseId: number | undefined = dto.warehouseId;

    // ==========================================================
    // LOGISTICS
    //
    // Siempre en su propia unidad.
    // ==========================================================

    if (this.isLogistics(user)) {
      if (!user.warehouse) {
        throw new BadRequestException(
          'El usuario LOGISTICS no tiene una unidad asignada.',
        );
      }

      warehouseId = user.warehouse.id;
    }

    // ==========================================================
    // ADMIN
    //
    // Si no seleccionó almacén, usamos el warehouse de la O.C.
    // ==========================================================

    if (this.isAdmin(user) && !warehouseId) {
      warehouseId = purchase.warehouse?.id;
    }

    if (!warehouseId) {
      throw new BadRequestException(
        'Debe indicar el almacén donde se recibirá la compra.',
      );
    }

    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id: warehouseId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Almacén de recepción no encontrado.');
    }

    // ==========================================================
    // SEGURIDAD LOGISTICS
    // ==========================================================

    if (this.isLogistics(user) && warehouse.id !== user.warehouse?.id) {
      throw new ForbiddenException(
        'Solo puedes recepcionar compras en tu propia unidad.',
      );
    }

    // ==========================================================
    // ENTRADAS DE INVENTARIO
    // ==========================================================

    for (const detail of purchase.details) {
      await this.stockMovementsService.processMovement(
        {
          movementType: MovementType.ENTRY,

          productId: detail.product.id,

          quantity: Number(detail.quantity),

          warehouseId: warehouse.id,

          reason: `Recepción O.C. ${purchase.purchaseOrderNumber}`,

          reference: purchase.purchaseOrderNumber,
        },

        userId,
      );
    }

    purchase.status = PurchaseStatus.RECEIVED;

    purchase.receivedWarehouse = warehouse;

    purchase.receivedBy = user;

    purchase.receivedAt = new Date();

    await this.purchaseRepository.save(purchase);

    return this.findOne(purchase.id, userId);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async remove(
    id: number,
    userId: number,
  ): Promise<{
    message: string;
  }> {
    const user = await this.getUser(userId);

    this.validateCanManage(user);

    const purchase = await this.findOne(id, userId);

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException(
        'No se puede eliminar una Orden de Compra que ya fue recepcionada.',
      );
    }

    await this.purchaseRepository.remove(purchase);

    return {
      message: 'Orden de Compra eliminada correctamente.',
    };
  }
}
