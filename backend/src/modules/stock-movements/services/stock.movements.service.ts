import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository, EntityManager } from 'typeorm';

import { StockMovement } from '../entities/stock-movement.entity';

import { Product } from '../../products/entities/product.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { User } from '../../users/entities/user.entity';

import { Inventory } from '../../inventory/entities/inventory.entity';

import { InventoryService } from '../../inventory/services/inventory.service';

import { CreateStockMovementDto } from '../dto/create-stock-movement.dto';

import { CreateBatchStockMovementDto } from '../dto/create-batch-stock-movement.dto';

import { MovementType } from '../entities/movement-type.enum';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly movementRepository: Repository<StockMovement>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly inventoryService: InventoryService,

    private readonly dataSource: DataSource,
  ) {}

  // ============================================================
  // OBTENER USUARIO
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
  // ACCESO GLOBAL
  // ============================================================

  private hasGlobalAccess(user: User): boolean {
    return user.role.code === 'ADMIN';
  }

  // ============================================================
  // WAREHOUSE DEL USUARIO
  // ============================================================

  private getUserWarehouseId(user: User): number {
    if (!user.warehouse) {
      throw new BadRequestException(
        'El usuario de logística no tiene una mina o almacén asignado.',
      );
    }

    return user.warehouse.id;
  }

  // ============================================================
  // VALIDAR PERMISO PARA CREAR MOVIMIENTO
  // ============================================================

  private validateMovementAccess(
    user: User,
    dto: CreateStockMovementDto,
  ): void {
    /*
     * ADMIN puede operar sobre cualquier warehouse.
     */

    if (this.hasGlobalAccess(user)) {
      return;
    }

    /*
     * Únicamente LOGISTICS debe llegar aquí
     * desde el controller.
     */

    if (user.role.code !== 'LOGISTICS') {
      throw new ForbiddenException(
        'No tienes permisos para realizar movimientos de inventario.',
      );
    }

    const warehouseId = this.getUserWarehouseId(user);

    // ==========================================================
    // ENTRY
    // OUTPUT
    // ADJUSTMENTS
    //
    // Solo pueden afectar SU warehouse.
    // ==========================================================

    if (
      dto.movementType === MovementType.ENTRY ||
      dto.movementType === MovementType.OUTPUT ||
      dto.movementType === MovementType.ADJUSTMENT_IN ||
      dto.movementType === MovementType.ADJUSTMENT_OUT
    ) {
      if (!dto.warehouseId || dto.warehouseId !== warehouseId) {
        throw new ForbiddenException(
          'Solo puedes realizar movimientos sobre tu mina o almacén asignado.',
        );
      }

      return;
    }

    // ==========================================================
    // TRANSFERENCIA
    //
    // LOGISTICS puede transferir DESDE su warehouse.
    //
    // Puede VER transferencias hacia su warehouse,
    // pero no crearlas quitando stock de otra sede.
    // ==========================================================

    if (dto.movementType === MovementType.TRANSFER) {
      if (!dto.sourceWarehouseId || dto.sourceWarehouseId !== warehouseId) {
        throw new ForbiddenException(
          'Solo puedes realizar transferencias cuyo almacén de origen sea tu mina o almacén asignado.',
        );
      }
    }
  }

  // ============================================================
  // PROCESAR MOVIMIENTO NORMAL
  // ============================================================

  async processMovement(
    dto: CreateStockMovementDto,

    userId: number,
  ): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      return this.processMovementWithManager(manager, dto, userId);
    });
  }

  // ============================================================
  // PROCESAR MOVIMIENTO MÚLTIPLE
  //
  // Todos los productos comparten:
  // - tipo de movimiento
  // - almacén / origen / destino
  // - motivo
  // - referencia
  //
  // Cada producto genera su propio StockMovement para conservar
  // trazabilidad individual en el historial.
  //
  // IMPORTANTE:
  // toda la operación se ejecuta en UNA sola transacción.
  // Si una línea falla, PostgreSQL revierte todas las anteriores.
  // ============================================================

  async processBatchMovement(
    dto: CreateBatchStockMovementDto,

    userId: number,
  ): Promise<StockMovement[]> {
    if (!dto.details || dto.details.length === 0) {
      throw new BadRequestException(
        'Debe indicar al menos un producto para registrar el movimiento.',
      );
    }

    const productIds = dto.details.map((detail) => detail.productId);

    if (new Set(productIds).size !== productIds.length) {
      throw new BadRequestException(
        'No se puede repetir el mismo producto dentro de una operación múltiple.',
      );
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const movements: StockMovement[] = [];

      for (const detail of dto.details) {
        const movementDto: CreateStockMovementDto = {
          movementType: dto.movementType,

          productId: detail.productId,

          quantity: detail.quantity,

          warehouseId: dto.warehouseId,

          sourceWarehouseId: dto.sourceWarehouseId,

          destinationWarehouseId: dto.destinationWarehouseId,

          reason: dto.reason?.trim() || undefined,

          reference: dto.reference?.trim() || undefined,
        };

        const movement = await this.processMovementWithManager(
          manager,
          movementDto,
          userId,
        );

        movements.push(movement);
      }

      return movements;
    });
  }

  // ============================================================
  // PROCESAR DENTRO DE TRANSACCIÓN EXISTENTE
  // ============================================================

  async processMovementWithManager(
    manager: EntityManager,

    dto: CreateStockMovementDto,

    userId: number,
  ): Promise<StockMovement> {
    /*
     * IMPORTANTE:
     *
     * Esto protege también movimientos creados
     * desde Compras o Solicitudes.
     */

    const user = await this.getAuthenticatedUser(userId, manager);

    this.validateMovementAccess(user, dto);

    switch (dto.movementType) {
      case MovementType.ENTRY:
        return this.processEntry(manager, dto, userId);

      case MovementType.OUTPUT:
        return this.processOutput(manager, dto, userId);

      case MovementType.TRANSFER:
        return this.processTransfer(manager, dto, userId);

      case MovementType.ADJUSTMENT_IN:
        return this.processAdjustmentIn(manager, dto, userId);

      case MovementType.ADJUSTMENT_OUT:
        return this.processAdjustmentOut(manager, dto, userId);

      default:
        throw new BadRequestException('Tipo de movimiento no válido.');
    }
  }

  // ============================================================
  // LISTAR MOVIMIENTOS
  // ============================================================

  async findAll(userId: number): Promise<StockMovement[]> {
    const user = await this.getAuthenticatedUser(userId);

    const query = this.movementRepository
      .createQueryBuilder('movement')

      // INVENTARIO ORIGEN

      .leftJoinAndSelect('movement.sourceInventory', 'sourceInventory')

      .leftJoinAndSelect('sourceInventory.product', 'sourceProduct')

      .leftJoinAndSelect('sourceProduct.category', 'sourceCategory')

      .leftJoinAndSelect('sourceInventory.warehouse', 'sourceWarehouse')

      // INVENTARIO DESTINO

      .leftJoinAndSelect(
        'movement.destinationInventory',
        'destinationInventory',
      )

      .leftJoinAndSelect('destinationInventory.product', 'destinationProduct')

      .leftJoinAndSelect('destinationProduct.category', 'destinationCategory')

      .leftJoinAndSelect(
        'destinationInventory.warehouse',
        'destinationWarehouse',
      )

      // USUARIO

      .leftJoinAndSelect('movement.user', 'user')

      .leftJoinAndSelect('user.role', 'role')

      .leftJoinAndSelect('user.warehouse', 'userWarehouse');

    // ==========================================================
    // LOGISTICS
    //
    // Ve movimientos donde su warehouse participe
    // como origen O destino.
    // ==========================================================

    if (!this.hasGlobalAccess(user)) {
      const warehouseId = this.getUserWarehouseId(user);

      query.andWhere(
        `(
          sourceWarehouse.id = :warehouseId
          OR destinationWarehouse.id = :warehouseId
        )`,
        {
          warehouseId,
        },
      );
    }

    query.orderBy('movement.createdAt', 'DESC');

    return query.getMany();
  }

  // ============================================================
  // BUSCAR UNO
  // ============================================================

  async findOne(id: number, userId: number): Promise<StockMovement> {
    const user = await this.getAuthenticatedUser(userId);

    const movement = await this.movementRepository.findOne({
      where: {
        id,
      },

      relations: {
        sourceInventory: {
          product: {
            category: true,
          },

          warehouse: true,
        },

        destinationInventory: {
          product: {
            category: true,
          },

          warehouse: true,
        },

        user: {
          role: true,
          warehouse: true,
        },
      },
    });

    if (!movement) {
      throw new NotFoundException('Movimiento no encontrado.');
    }

    /*
     * ADMIN puede verlo.
     */

    if (this.hasGlobalAccess(user)) {
      return movement;
    }

    const warehouseId = this.getUserWarehouseId(user);

    const sourceWarehouseId = movement.sourceInventory?.warehouse?.id;

    const destinationWarehouseId = movement.destinationInventory?.warehouse?.id;

    /*
     * Debe participar como origen o destino.
     */

    if (
      sourceWarehouseId !== warehouseId &&
      destinationWarehouseId !== warehouseId
    ) {
      throw new NotFoundException('Movimiento no encontrado.');
    }

    return movement;
  }

  // ============================================================
  // ENTRADA
  // ============================================================

  private async processEntry(
    manager: EntityManager,

    dto: CreateStockMovementDto,

    userId: number,
  ): Promise<StockMovement> {
    if (!dto.warehouseId) {
      throw new BadRequestException(
        'El almacén de destino es obligatorio para las entradas.',
      );
    }

    const product = await manager.findOne(Product, {
      where: {
        id: dto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    const warehouse = await manager.findOne(Warehouse, {
      where: {
        id: dto.warehouseId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Almacén no encontrado.');
    }

    if (!warehouse.isActive) {
      throw new BadRequestException('El almacén de destino está inactivo.');
    }

    let inventory = await manager.findOne(Inventory, {
      where: {
        product: {
          id: dto.productId,
        },

        warehouse: {
          id: dto.warehouseId,
        },
      },

      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventory) {
      inventory = manager.create(Inventory, {
        product,
        warehouse,
        quantity: 0,
      });
    }

    inventory.quantity += dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      reason: dto.reason,

      reference: dto.reference,

      destinationInventory: inventory,

      user: {
        id: userId,
      } as User,
    });

    return manager.save(StockMovement, movement);
  }

  // ============================================================
  // SALIDA
  // ============================================================

  private async processOutput(
    manager: EntityManager,

    dto: CreateStockMovementDto,

    userId: number,
  ): Promise<StockMovement> {
    if (!dto.warehouseId) {
      throw new BadRequestException(
        'El almacén de origen es obligatorio para las salidas.',
      );
    }

    const inventory = await manager.findOne(Inventory, {
      where: {
        product: {
          id: dto.productId,
        },

        warehouse: {
          id: dto.warehouseId,
        },
      },

      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventory || inventory.quantity < dto.quantity) {
      throw new BadRequestException(
        'Stock insuficiente en el almacén especificado.',
      );
    }

    inventory.quantity -= dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      reason: dto.reason,

      reference: dto.reference,

      sourceInventory: inventory,

      user: {
        id: userId,
      } as User,
    });

    return manager.save(StockMovement, movement);
  }

  // ============================================================
  // TRANSFERENCIA
  // ============================================================

  private async processTransfer(
    manager: EntityManager,

    dto: CreateStockMovementDto,

    userId: number,
  ): Promise<StockMovement> {
    if (!dto.sourceWarehouseId || !dto.destinationWarehouseId) {
      throw new BadRequestException(
        'Los almacenes de origen y destino son obligatorios para transferencias.',
      );
    }

    if (dto.sourceWarehouseId === dto.destinationWarehouseId) {
      throw new BadRequestException(
        'El almacén de origen y destino no pueden ser el mismo.',
      );
    }

    const sourceInventory = await manager.findOne(Inventory, {
      where: {
        product: {
          id: dto.productId,
        },

        warehouse: {
          id: dto.sourceWarehouseId,
        },
      },

      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (!sourceInventory || sourceInventory.quantity < dto.quantity) {
      throw new BadRequestException(
        'Stock insuficiente en el almacén de origen.',
      );
    }

    sourceInventory.quantity -= dto.quantity;

    await manager.save(Inventory, sourceInventory);

    let destinationInventory = await manager.findOne(Inventory, {
      where: {
        product: {
          id: dto.productId,
        },

        warehouse: {
          id: dto.destinationWarehouseId,
        },
      },

      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (!destinationInventory) {
      const product = await manager.findOne(Product, {
        where: {
          id: dto.productId,
        },
      });

      if (!product) {
        throw new NotFoundException('Producto no encontrado.');
      }

      const warehouse = await manager.findOne(Warehouse, {
        where: {
          id: dto.destinationWarehouseId,
        },
      });

      if (!warehouse) {
        throw new NotFoundException('Almacén destino no encontrado.');
      }

      if (!warehouse.isActive) {
        throw new BadRequestException('El almacén destino está inactivo.');
      }

      destinationInventory = manager.create(Inventory, {
        product,
        warehouse,
        quantity: 0,
      });
    }

    destinationInventory.quantity += dto.quantity;

    await manager.save(Inventory, destinationInventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      reason: dto.reason,

      reference: dto.reference,

      sourceInventory,

      destinationInventory,

      user: {
        id: userId,
      } as User,
    });

    return manager.save(StockMovement, movement);
  }

  // ============================================================
  // AJUSTE ENTRADA
  // ============================================================

  private async processAdjustmentIn(
    manager: EntityManager,

    dto: CreateStockMovementDto,

    userId: number,
  ): Promise<StockMovement> {
    if (!dto.warehouseId) {
      throw new BadRequestException(
        'El almacén es obligatorio para los ajustes.',
      );
    }

    const product = await manager.findOne(Product, {
      where: {
        id: dto.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado.');
    }

    const warehouse = await manager.findOne(Warehouse, {
      where: {
        id: dto.warehouseId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Almacén no encontrado.');
    }

    let inventory = await manager.findOne(Inventory, {
      where: {
        product: {
          id: dto.productId,
        },

        warehouse: {
          id: dto.warehouseId,
        },
      },

      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventory) {
      inventory = manager.create(Inventory, {
        product,
        warehouse,
        quantity: 0,
      });
    }

    inventory.quantity += dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      reason: dto.reason,

      reference: dto.reference,

      destinationInventory: inventory,

      user: {
        id: userId,
      } as User,
    });

    return manager.save(StockMovement, movement);
  }

  // ============================================================
  // AJUSTE SALIDA
  // ============================================================

  private async processAdjustmentOut(
    manager: EntityManager,

    dto: CreateStockMovementDto,

    userId: number,
  ): Promise<StockMovement> {
    if (!dto.warehouseId) {
      throw new BadRequestException(
        'El almacén es obligatorio para los ajustes.',
      );
    }

    const inventory = await manager.findOne(Inventory, {
      where: {
        product: {
          id: dto.productId,
        },

        warehouse: {
          id: dto.warehouseId,
        },
      },

      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (!inventory || inventory.quantity < dto.quantity) {
      throw new BadRequestException(
        'Stock insuficiente para realizar el ajuste de salida.',
      );
    }

    inventory.quantity -= dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      reason: dto.reason,

      reference: dto.reference,

      sourceInventory: inventory,

      user: {
        id: userId,
      } as User,
    });

    return manager.save(StockMovement, movement);
  }
}
