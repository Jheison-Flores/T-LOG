import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, Repository } from 'typeorm';

import { Request } from '../entities/request.entity';

import { RequestDetail } from '../entities/request-detail.entity';

import { RequestDispatch } from '../entities/request-dispatch.entity';

import { RequestDispatchDetail } from '../entities/request-dispatch.detail.entity';

import { RequestStatus } from '../entities/request-status.enum';

import { Product } from '../../products/entities/product.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { User } from '../../users/entities/user.entity';

import { StockMovementsService } from '../../stock-movements/services/stock.movements.service';

import { MovementType } from '../../stock-movements/entities/movement-type.enum';

import { CreateRequestDto } from '../dto/create-request.dto';

import { ApproveRequestDto } from '../dto/approve-request.dto';

import { RejectRequestDto } from '../dto/reject-request.dto';

import { DeliverRequestDto } from '../dto/deliver-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,

    @InjectRepository(RequestDetail)
    private readonly detailRepository: Repository<RequestDetail>,

    @InjectRepository(RequestDispatch)
    private readonly dispatchRepository: Repository<RequestDispatch>,

    @InjectRepository(RequestDispatchDetail)
    private readonly dispatchDetailRepository: Repository<RequestDispatchDetail>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly stockMovementsService: StockMovementsService,

    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // GENERAR NÚMERO DE REQUERIMIENTO
  // ============================================================

  private async generateRequestNumber(manager: EntityManager): Promise<string> {
    const total = await manager.count(Request);

    const correlativo = String(total + 1).padStart(6, '0');

    return `REQ-${new Date().getFullYear()}-${correlativo}`;
  }

  // ============================================================
  // GENERAR NÚMERO DE DESPACHO
  // ============================================================

  private async generateDispatchNumber(
    manager: EntityManager,
  ): Promise<string> {
    const total = await manager.count(RequestDispatch);

    const correlativo = String(total + 1).padStart(6, '0');

    return `DSP-${new Date().getFullYear()}-${correlativo}`;
  }

  // ============================================================
  // OBTENER USUARIO AUTENTICADO
  // ============================================================

  private async getAuthenticatedUser(
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
      throw new BadRequestException('El usuario se encuentra inactivo.');
    }

    return user;
  }

  // ============================================================
  // LOGÍSTICA LIMA
  //
  // En tu BD Lima utiliza MAIN.
  // CENTRAL se conserva por compatibilidad.
  // ============================================================

  private isCentralLogistics(user: User): boolean {
    if (user.role.code !== 'LOGISTICS' || !user.warehouse) {
      return false;
    }

    const warehouseType = String(user.warehouse.type ?? '').toUpperCase();

    return warehouseType === 'MAIN' || warehouseType === 'CENTRAL';
  }

  // ============================================================
  // ACCESO GLOBAL A REQUERIMIENTOS
  //
  // ADMIN:
  // ve todos.
  //
  // LOGISTICS LIMA:
  // ve todos porque debe atender a las minas.
  //
  // LOGISTICS MINA:
  // solo ve los de su mina.
  // ============================================================

  private hasGlobalRequestAccess(user: User): boolean {
    return user.role.code === 'ADMIN' || this.isCentralLogistics(user);
  }

  // ============================================================
  // OBTENER REQUERIMIENTO DENTRO DE TRANSACCIÓN
  // ============================================================

  private async getRequest(
    id: number,
    manager: EntityManager,
  ): Promise<Request> {
    const request = await manager.findOne(Request, {
      where: {
        id,
      },

      relations: {
        details: {
          product: {
            category: true,
          },
        },

        warehouse: true,

        createdBy: {
          role: true,
          warehouse: true,
        },

        reviewedBy: {
          role: true,
          warehouse: true,
        },

        approvedBy: {
          role: true,
          warehouse: true,
        },

        dispatches: {
          sourceWarehouse: true,

          destinationWarehouse: true,

          createdBy: {
            role: true,
            warehouse: true,
          },

          details: {
            product: true,
            requestDetail: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Requerimiento no encontrado.');
    }

    if (request.dispatches) {
      request.dispatches.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return request;
  }

  // ============================================================
  // VALIDAR PENDIENTE
  // ============================================================

  private validatePending(request: Request): void {
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Solo los requerimientos pendientes pueden realizar esta acción.',
      );
    }
  }

  // ============================================================
  // VALIDAR DESPACHABLE
  // ============================================================

  private validateDeliverable(request: Request): void {
    const validStatuses = [
      RequestStatus.APPROVED,
      RequestStatus.PARTIAL,
      RequestStatus.IN_PROGRESS,
    ];

    if (!validStatuses.includes(request.status)) {
      throw new BadRequestException(
        'El requerimiento no se encuentra disponible para despacho.',
      );
    }
  }

  // ============================================================
  // CREAR REQUERIMIENTO
  // ============================================================

  async create(dto: CreateRequestDto, userId: number): Promise<Request> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // ======================================================
      // USUARIO
      // ======================================================

      const user = await this.getAuthenticatedUser(userId, manager);

      let warehouse: Warehouse | null = null;

      // ======================================================
      // ADMIN
      // ======================================================

      if (user.role.code === 'ADMIN') {
        if (!dto.warehouseId) {
          throw new BadRequestException(
            'Debe seleccionar el almacén o mina solicitante.',
          );
        }

        warehouse = await manager.findOne(Warehouse, {
          where: {
            id: dto.warehouseId,
          },
        });

        if (!warehouse) {
          throw new NotFoundException(
            'Almacén o mina solicitante no encontrado.',
          );
        }
      } else {
        // ====================================================
        // LOGISTICS
        // ====================================================

        if (!user.warehouse) {
          throw new BadRequestException(
            'El usuario no tiene una mina o almacén asignado.',
          );
        }

        warehouse = user.warehouse;
      }

      if (!warehouse.isActive) {
        throw new BadRequestException(
          'El almacén o mina solicitante se encuentra inactivo.',
        );
      }

      // ======================================================
      // DETALLES
      // ======================================================

      if (!dto.details || dto.details.length === 0) {
        throw new BadRequestException(
          'El requerimiento debe contener al menos un producto.',
        );
      }

      // ======================================================
      // PRODUCTOS REPETIDOS
      // ======================================================

      const productIds = dto.details.map((detail) => detail.productId);

      if (new Set(productIds).size !== productIds.length) {
        throw new BadRequestException(
          'No se puede agregar el mismo producto más de una vez en el requerimiento.',
        );
      }

      // ======================================================
      // CABECERA
      // ======================================================

      const request = manager.create(Request, {
        requestNumber: await this.generateRequestNumber(manager),

        requester: dto.requester.trim(),

        observations: dto.observations?.trim(),

        warehouse,

        createdBy: user,

        status: RequestStatus.PENDING,

        reviewedBy: null,

        reviewedAt: null,

        approvedBy: null,

        approvedAt: null,

        rejectionReason: null,
      });

      const savedRequest = await manager.save(Request, request);

      // ======================================================
      // CREAR DETALLES
      // ======================================================

      const details: RequestDetail[] = [];

      for (const item of dto.details) {
        const product = await manager.findOne(Product, {
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto ${item.productId} no encontrado.`,
          );
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `El producto "${product.name}" se encuentra inactivo.`,
          );
        }

        if (Number(item.quantity) <= 0) {
          throw new BadRequestException(
            `La cantidad del producto "${product.name}" debe ser mayor a cero.`,
          );
        }

        const detail = manager.create(RequestDetail, {
          request: savedRequest,

          product,

          quantity: item.quantity,

          approvedQuantity: 0,

          deliveredQuantity: 0,

          observations: item.observations?.trim(),
        });

        details.push(detail);
      }

      await manager.save(RequestDetail, details);

      return this.getRequest(savedRequest.id, manager);
    });
  }

  // ============================================================
  // LISTAR REQUERIMIENTOS
  // ============================================================

  async findAll(userId: number): Promise<Request[]> {
    const user = await this.getAuthenticatedUser(userId);

    const query = this.requestRepository
      .createQueryBuilder('request')

      .leftJoinAndSelect('request.warehouse', 'warehouse')

      .leftJoinAndSelect('request.createdBy', 'createdBy')

      .leftJoinAndSelect('createdBy.role', 'createdByRole')

      .leftJoinAndSelect('createdBy.warehouse', 'createdByWarehouse')

      .leftJoinAndSelect('request.reviewedBy', 'reviewedBy')

      .leftJoinAndSelect('reviewedBy.role', 'reviewedByRole')

      .leftJoinAndSelect('reviewedBy.warehouse', 'reviewedByWarehouse')

      .leftJoinAndSelect('request.approvedBy', 'approvedBy')

      .leftJoinAndSelect('approvedBy.role', 'approvedByRole')

      .leftJoinAndSelect('approvedBy.warehouse', 'approvedByWarehouse')

      .leftJoinAndSelect('request.details', 'details')

      .leftJoinAndSelect('details.product', 'product')

      .leftJoinAndSelect('product.category', 'category')

      .leftJoinAndSelect('request.dispatches', 'dispatches')

      .leftJoinAndSelect(
        'dispatches.sourceWarehouse',
        'dispatchSourceWarehouse',
      )

      .leftJoinAndSelect(
        'dispatches.destinationWarehouse',
        'dispatchDestinationWarehouse',
      )

      .leftJoinAndSelect('dispatches.createdBy', 'dispatchCreatedBy')

      .leftJoinAndSelect('dispatchCreatedBy.role', 'dispatchCreatedByRole')

      .leftJoinAndSelect('dispatches.details', 'dispatchDetails')

      .leftJoinAndSelect('dispatchDetails.product', 'dispatchProduct');

    // ==========================================================
    // LOGISTICS DE MINA
    // ==========================================================

    if (!this.hasGlobalRequestAccess(user)) {
      if (!user.warehouse) {
        throw new BadRequestException(
          'El usuario no tiene una mina o almacén asignado.',
        );
      }

      query.andWhere('warehouse.id = :warehouseId', {
        warehouseId: user.warehouse.id,
      });
    }

    query.orderBy('request.createdAt', 'DESC');

    query.addOrderBy('dispatches.createdAt', 'DESC');

    return query.getMany();
  }

  // ============================================================
  // OBTENER UN REQUERIMIENTO
  // ============================================================

  async findOne(id: number, userId: number): Promise<Request> {
    const user = await this.getAuthenticatedUser(userId);

    const request = await this.requestRepository.findOne({
      where: {
        id,
      },

      relations: {
        details: {
          product: {
            category: true,
          },
        },

        warehouse: true,

        createdBy: {
          role: true,
          warehouse: true,
        },

        reviewedBy: {
          role: true,
          warehouse: true,
        },

        approvedBy: {
          role: true,
          warehouse: true,
        },

        dispatches: {
          sourceWarehouse: true,

          destinationWarehouse: true,

          createdBy: {
            role: true,
            warehouse: true,
          },

          details: {
            product: true,

            requestDetail: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Requerimiento no encontrado.');
    }

    // ==========================================================
    // ADMIN / LOGISTICS LIMA
    // ==========================================================

    if (this.hasGlobalRequestAccess(user)) {
      if (request.dispatches) {
        request.dispatches.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }

      return request;
    }

    // ==========================================================
    // LOGISTICS MINA
    // ==========================================================

    if (!user.warehouse) {
      throw new BadRequestException(
        'El usuario no tiene una mina o almacén asignado.',
      );
    }

    if (request.warehouse.id !== user.warehouse.id) {
      throw new NotFoundException('Requerimiento no encontrado.');
    }

    if (request.dispatches) {
      request.dispatches.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return request;
  }

  // ============================================================
  // APROBAR / APROBAR PARCIALMENTE
  // ============================================================

  async approve(
    id: number,
    dto: ApproveRequestDto,
    userId: number,
  ): Promise<Request> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const request = await this.getRequest(id, manager);

      this.validatePending(request);

      const approvingUser = await this.getAuthenticatedUser(userId, manager);

      // ======================================================
      // TODOS LOS DETALLES
      // ======================================================

      if (dto.details.length !== request.details.length) {
        throw new BadRequestException(
          'Debe indicar la cantidad aprobada para todos los productos del requerimiento.',
        );
      }

      // ======================================================
      // DUPLICADOS
      // ======================================================

      const receivedDetailIds = dto.details.map((detail) => detail.detailId);

      if (new Set(receivedDetailIds).size !== receivedDetailIds.length) {
        throw new BadRequestException(
          'Existen detalles repetidos en la aprobación.',
        );
      }

      let hasApproved = false;

      let allFullyApproved = true;

      // ======================================================
      // REVISAR CADA DETALLE
      // ======================================================

      for (const requestDetail of request.details) {
        const approval = dto.details.find(
          (item) => item.detailId === requestDetail.id,
        );

        if (!approval) {
          throw new BadRequestException(
            `Falta indicar la cantidad aprobada para el detalle ${requestDetail.id}.`,
          );
        }

        const requestedQuantity = Number(requestDetail.quantity);

        const approvedQuantity = Number(approval.approvedQuantity);

        if (!Number.isFinite(approvedQuantity)) {
          throw new BadRequestException(
            `Cantidad aprobada inválida para "${requestDetail.product.name}".`,
          );
        }

        if (approvedQuantity < 0) {
          throw new BadRequestException(
            'La cantidad aprobada no puede ser negativa.',
          );
        }

        if (approvedQuantity > requestedQuantity) {
          throw new BadRequestException(
            `La cantidad aprobada de "${requestDetail.product.name}" no puede ser mayor a la cantidad solicitada.`,
          );
        }

        requestDetail.approvedQuantity = approvedQuantity;

        requestDetail.deliveredQuantity = 0;

        await manager.save(RequestDetail, requestDetail);

        if (approvedQuantity > 0) {
          hasApproved = true;
        }

        if (approvedQuantity !== requestedQuantity) {
          allFullyApproved = false;
        }
      }

      // ======================================================
      // ESTADO
      // ======================================================

      if (!hasApproved) {
        request.status = RequestStatus.REJECTED;

        request.rejectionReason =
          dto.observations?.trim() || 'Requerimiento no aprobado.';
      } else if (allFullyApproved) {
        request.status = RequestStatus.APPROVED;

        request.rejectionReason = null;
      } else {
        request.status = RequestStatus.PARTIAL;

        request.rejectionReason = null;
      }

      request.approvedBy = approvingUser;

      request.approvedAt = new Date();

      // ======================================================
      // OBSERVACIÓN
      // ======================================================

      if (dto.observations?.trim()) {
        const reviewText = dto.observations.trim();

        request.observations = request.observations
          ? `${request.observations}\n\nRevisión: ${reviewText}`
          : `Revisión: ${reviewText}`;
      }

      await manager.save(Request, request);

      return this.getRequest(id, manager);
    });
  }

  // ============================================================
  // RECHAZAR COMPLETAMENTE
  // ============================================================

  async reject(
    id: number,
    dto: RejectRequestDto,
    userId: number,
  ): Promise<Request> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const request = await this.getRequest(id, manager);

      this.validatePending(request);

      const approvingUser = await this.getAuthenticatedUser(userId, manager);

      for (const detail of request.details) {
        detail.approvedQuantity = 0;

        detail.deliveredQuantity = 0;

        await manager.save(RequestDetail, detail);
      }

      request.status = RequestStatus.REJECTED;

      request.rejectionReason = dto.reason.trim();

      request.approvedBy = approvingUser;

      request.approvedAt = new Date();

      await manager.save(Request, request);

      return this.getRequest(id, manager);
    });
  }

  // ============================================================
  // DESPACHAR REQUERIMIENTO
  // ============================================================

  async deliver(
    id: number,
    dto: DeliverRequestDto,
    userId: number,
  ): Promise<Request> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      // ======================================================
      // REQUERIMIENTO
      // ======================================================

      const request = await this.getRequest(id, manager);

      this.validateDeliverable(request);

      // ======================================================
      // USUARIO
      // ======================================================

      const user = await this.getAuthenticatedUser(userId, manager);

      // ======================================================
      // LOGISTICS DE MINA NO PUEDE DESPACHAR
      // ======================================================

      if (user.role.code === 'LOGISTICS' && !this.isCentralLogistics(user)) {
        throw new BadRequestException(
          'Solo el personal logístico de Lima puede despachar requerimientos hacia las minas.',
        );
      }

      // ======================================================
      // ALMACÉN ORIGEN
      // ======================================================

      const sourceWarehouse = await manager.findOne(Warehouse, {
        where: {
          id: dto.sourceWarehouseId,
        },
      });

      if (!sourceWarehouse) {
        throw new NotFoundException('Almacén de origen no encontrado.');
      }

      if (!sourceWarehouse.isActive) {
        throw new BadRequestException(
          'El almacén de origen se encuentra inactivo.',
        );
      }

      // ======================================================
      // LOGISTICS SOLO DESDE SU ALMACÉN
      // ======================================================

      if (user.role.code === 'LOGISTICS') {
        if (!user.warehouse) {
          throw new BadRequestException(
            'El usuario no tiene un almacén asignado.',
          );
        }

        if (user.warehouse.id !== sourceWarehouse.id) {
          throw new BadRequestException(
            'Solo puedes despachar materiales desde tu almacén asignado.',
          );
        }
      }

      // ======================================================
      // ORIGEN != DESTINO
      // ======================================================

      if (sourceWarehouse.id === request.warehouse.id) {
        throw new BadRequestException(
          'El almacén de origen y la mina de destino no pueden ser el mismo.',
        );
      }

      // ======================================================
      // DETALLES
      // ======================================================

      if (!dto.details || dto.details.length === 0) {
        throw new BadRequestException(
          'Debe indicar al menos un producto para despachar.',
        );
      }

      // ======================================================
      // DUPLICADOS
      // ======================================================

      const receivedIds = dto.details.map((detail) => detail.detailId);

      if (new Set(receivedIds).size !== receivedIds.length) {
        throw new BadRequestException(
          'Existen productos repetidos en el despacho.',
        );
      }

      // ======================================================
      // PRODUCTOS CON CANTIDAD > 0
      // ======================================================

      const detailsToDispatch = dto.details.filter(
        (detail) => Number(detail.quantity) > 0,
      );

      if (detailsToDispatch.length === 0) {
        throw new BadRequestException(
          'Debe indicar una cantidad mayor a cero para al menos un producto.',
        );
      }

      // ======================================================
      // VALIDACIONES
      // ======================================================

      for (const item of detailsToDispatch) {
        const requestDetail = request.details.find(
          (detail) => detail.id === item.detailId,
        );

        if (!requestDetail) {
          throw new BadRequestException(
            `El detalle ${item.detailId} no pertenece a este requerimiento.`,
          );
        }

        const quantity = Number(item.quantity);

        const approved = Number(requestDetail.approvedQuantity);

        const delivered = Number(requestDetail.deliveredQuantity);

        const pending = approved - delivered;

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new BadRequestException(
            `La cantidad a despachar de "${requestDetail.product.name}" debe ser mayor a cero.`,
          );
        }

        if (approved <= 0) {
          throw new BadRequestException(
            `El producto "${requestDetail.product.name}" no fue aprobado.`,
          );
        }

        if (pending <= 0) {
          throw new BadRequestException(
            `El producto "${requestDetail.product.name}" ya fue despachado completamente.`,
          );
        }

        if (quantity > pending) {
          throw new BadRequestException(
            `Solo quedan ${pending} ${requestDetail.product.unit} pendientes de "${requestDetail.product.name}".`,
          );
        }
      }

      // ======================================================
      // CABECERA DESPACHO
      // ======================================================

      const dispatch = manager.create(RequestDispatch, {
        dispatchNumber: await this.generateDispatchNumber(manager),

        request,

        sourceWarehouse,

        destinationWarehouse: request.warehouse,

        createdBy: user,

        observations: dto.observations?.trim() || null,
      });

      const savedDispatch = await manager.save(RequestDispatch, dispatch);

      const dispatchDetails: RequestDispatchDetail[] = [];

      // ======================================================
      // TRANSFERENCIA
      // ======================================================

      for (const item of detailsToDispatch) {
        const requestDetail = request.details.find(
          (detail) => detail.id === item.detailId,
        );

        if (!requestDetail) {
          throw new BadRequestException(
            'Detalle de requerimiento no encontrado.',
          );
        }

        const quantity = Number(item.quantity);

        // ====================================================
        // MOVIMIENTO DE INVENTARIO
        // ====================================================

        await this.stockMovementsService.processMovementWithManager(
          manager,
          {
            movementType: MovementType.TRANSFER,

            productId: requestDetail.product.id,

            quantity,

            sourceWarehouseId: sourceWarehouse.id,

            destinationWarehouseId: request.warehouse.id,

            reason: `Despacho ${savedDispatch.dispatchNumber} - ${request.requestNumber}`,

            reference: savedDispatch.dispatchNumber,
          },
          userId,
        );

        // ====================================================
        // CANTIDAD DESPACHADA
        // ====================================================

        requestDetail.deliveredQuantity =
          Number(requestDetail.deliveredQuantity) + quantity;

        await manager.save(RequestDetail, requestDetail);

        // ====================================================
        // DETALLE DESPACHO
        // ====================================================

        const dispatchDetail = manager.create(RequestDispatchDetail, {
          dispatch: savedDispatch,

          requestDetail,

          product: requestDetail.product,

          quantity,
        });

        dispatchDetails.push(dispatchDetail);
      }

      await manager.save(RequestDispatchDetail, dispatchDetails);

      // ======================================================
      // ESTADO
      // ======================================================

      const approvedDetails = request.details.filter(
        (detail) => Number(detail.approvedQuantity) > 0,
      );

      const allDelivered = approvedDetails.every(
        (detail) =>
          Number(detail.deliveredQuantity) >= Number(detail.approvedQuantity),
      );

      if (allDelivered) {
        request.status = RequestStatus.DELIVERED;
      } else {
        request.status = RequestStatus.IN_PROGRESS;
      }

      await manager.save(Request, request);

      return this.getRequest(id, manager);
    });
  }
}
