import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { DataSource, Repository, EntityManager } from 'typeorm';

import { StockMovement } from '../entities/stock-movement.entity';

import type { CostCurrency } from '../entities/stock-movement.entity';

import { Product } from '../../products/entities/product.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { User } from '../../users/entities/user.entity';

import { Inventory } from '../../inventory/entities/inventory.entity';

import { InventoryService } from '../../inventory/services/inventory.service';

import { CreateStockMovementDto } from '../dto/create-stock-movement.dto';

import { CreateBatchStockMovementDto } from '../dto/create-batch-stock-movement.dto';

import { MovementType } from '../entities/movement-type.enum';

export interface InventoryValuation {
  unitCost: number;
  currency: CostCurrency;
}

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

          unitCost: detail.unitCost,

          currency: detail.currency,

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
  // NORMALIZAR PRECIO UNITARIO
  // ============================================================

  private normalizeUnitCost(value: unknown): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const unitCost = Number(value);

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      throw new BadRequestException(
        'El precio unitario debe ser un número mayor o igual a cero.',
      );
    }

    return Number(unitCost.toFixed(4));
  }

  // ============================================================
  // NORMALIZAR MONEDA
  // ============================================================

  private normalizeCurrency(value: unknown): CostCurrency | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const currency = String(value).trim().toUpperCase();

    if (currency !== 'PEN' && currency !== 'USD') {
      throw new BadRequestException('La moneda debe ser PEN o USD.');
    }

    return currency as CostCurrency;
  }

  // ============================================================
  // VALIDAR PRECIO + MONEDA
  //
  // REGLAS:
  //
  // - sin precio → sin moneda
  // - con precio → moneda obligatoria
  // - no permitimos moneda sin precio
  // ============================================================

  private normalizeExplicitValuation(
    unitCostValue: unknown,
    currencyValue: unknown,
  ): {
    unitCost: number | null;
    currency: CostCurrency | null;
  } {
    const unitCost = this.normalizeUnitCost(unitCostValue);

    const currency = this.normalizeCurrency(currencyValue);

    if (unitCost === null && currency !== null) {
      throw new BadRequestException(
        'No se puede indicar una moneda sin registrar un precio unitario.',
      );
    }

    if (unitCost !== null && currency === null) {
      throw new BadRequestException(
        'Debe indicar la moneda del precio unitario: PEN o USD.',
      );
    }

    return {
      unitCost,
      currency,
    };
  }

  // ============================================================
  // CALCULAR COSTO TOTAL
  // ============================================================

  private calculateTotalCost(
    quantity: number,
    unitCost: number | null,
  ): number | null {
    if (unitCost === null) {
      return null;
    }

    return Number((quantity * unitCost).toFixed(2));
  }

  // ============================================================
  // ÚLTIMA VALORIZACIÓN VÁLIDA DEL INVENTARIO
  //
  // Busca el último movimiento valorizado que haya INGRESADO
  // el producto al almacén.
  //
  // Puede provenir de:
  //
  // ENTRY
  // TRANSFER
  // ADJUSTMENT_IN
  //
  // IMPORTANTE:
  //
  // Solo considera registros que tengan:
  //
  // unitCost + currency
  //
  // De esta manera NO asumimos que los movimientos históricos
  // anteriores a la implementación de moneda estaban en soles.
  // ============================================================

  async getLatestInventoryValuation(
    manager: EntityManager,
    productId: number,
    warehouseId: number,
  ): Promise<InventoryValuation | null> {
    const movement = await manager
      .getRepository(StockMovement)
      .createQueryBuilder('movement')

      .innerJoin('movement.destinationInventory', 'destinationInventory')

      .innerJoin('destinationInventory.product', 'product')

      .innerJoin('destinationInventory.warehouse', 'warehouse')

      .where('product.id = :productId', {
        productId,
      })

      .andWhere('warehouse.id = :warehouseId', {
        warehouseId,
      })

      .andWhere('movement.unitCost IS NOT NULL')

      .andWhere('movement.currency IS NOT NULL')

      .andWhere('movement.currency IN (:...currencies)', {
        currencies: ['PEN', 'USD'],
      })

      .andWhere('movement.movementType IN (:...movementTypes)', {
        movementTypes: [
          MovementType.ENTRY,
          MovementType.TRANSFER,
          MovementType.ADJUSTMENT_IN,
        ],
      })

      .orderBy('movement.createdAt', 'DESC')

      .addOrderBy('movement.id', 'DESC')

      .getOne();

    if (
      !movement ||
      movement.unitCost === null ||
      movement.unitCost === undefined ||
      !movement.currency
    ) {
      return null;
    }

    const unitCost = Number(movement.unitCost);

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      return null;
    }

    const currency = this.normalizeCurrency(movement.currency);

    if (currency === null) {
      return null;
    }

    return {
      unitCost: Number(unitCost.toFixed(4)),

      currency,
    };
  }

  // ============================================================
  // COMPATIBILIDAD
  //
  // Conservamos este método porque actualmente otros módulos
  // pueden estar utilizándolo.
  //
  // En la Entrega 3, Guías pasará a utilizar directamente:
  //
  // getLatestInventoryValuation()
  // ============================================================

  async getLatestInventoryUnitCost(
    manager: EntityManager,
    productId: number,
    warehouseId: number,
  ): Promise<number | null> {
    const valuation = await this.getLatestInventoryValuation(
      manager,
      productId,
      warehouseId,
    );

    return valuation?.unitCost ?? null;
  }

  // ============================================================
  // LISTAR MOVIMIENTOS
  // ============================================================

  async findAll(userId: number): Promise<StockMovement[]> {
    const user = await this.getAuthenticatedUser(userId);

    const query = this.movementRepository
      .createQueryBuilder('movement')

      .leftJoinAndSelect('movement.sourceInventory', 'sourceInventory')

      .leftJoinAndSelect('sourceInventory.product', 'sourceProduct')

      .leftJoinAndSelect('sourceProduct.category', 'sourceCategory')

      .leftJoinAndSelect('sourceInventory.warehouse', 'sourceWarehouse')

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

      .leftJoinAndSelect('movement.user', 'user')

      .leftJoinAndSelect('user.role', 'role')

      .leftJoinAndSelect('user.warehouse', 'userWarehouse');

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

    if (this.hasGlobalAccess(user)) {
      return movement;
    }

    const warehouseId = this.getUserWarehouseId(user);

    const sourceWarehouseId = movement.sourceInventory?.warehouse?.id;

    const destinationWarehouseId = movement.destinationInventory?.warehouse?.id;

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

    // ==========================================================
    // VALORIZACIÓN DE LA ENTRADA
    // ==========================================================

    const valuation = this.normalizeExplicitValuation(
      dto.unitCost,
      dto.currency,
    );

    const totalCost = this.calculateTotalCost(dto.quantity, valuation.unitCost);

    inventory.quantity += dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      unitCost: valuation.unitCost,

      totalCost,

      currency: valuation.currency,

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
  //
  // La valorización NO se solicita manualmente.
  // Se hereda del último ingreso valorizado válido.
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

    const valuation = await this.getLatestInventoryValuation(
      manager,
      dto.productId,
      dto.warehouseId,
    );

    const unitCost = valuation?.unitCost ?? null;

    const currency = valuation?.currency ?? null;

    const totalCost = this.calculateTotalCost(dto.quantity, unitCost);

    inventory.quantity -= dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      unitCost,

      totalCost,

      currency,

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

    // ==========================================================
    // DETERMINAR VALORIZACIÓN DE LA TRANSFERENCIA
    //
    // PRIORIDAD:
    //
    // 1. Si se manda unitCost/currency explícitamente,
    //    conservamos exactamente esa valorización.
    //
    // 2. Si ninguno viene informado, buscamos la última
    //    valorización válida del inventario de origen.
    //
    // Esto permitirá que la Guía de Remisión conserve exactamente
    // el mismo precio y moneda.
    // ==========================================================

    const hasProvidedUnitCost =
      dto.unitCost !== undefined && dto.unitCost !== null;

    const hasProvidedCurrency =
      dto.currency !== undefined && dto.currency !== null;

    let unitCost: number | null = null;

    let currency: CostCurrency | null = null;

    if (hasProvidedUnitCost || hasProvidedCurrency) {
      const explicitValuation = this.normalizeExplicitValuation(
        dto.unitCost,
        dto.currency,
      );

      unitCost = explicitValuation.unitCost;

      currency = explicitValuation.currency;
    } else {
      const inventoryValuation = await this.getLatestInventoryValuation(
        manager,
        dto.productId,
        dto.sourceWarehouseId,
      );

      unitCost = inventoryValuation?.unitCost ?? null;

      currency = inventoryValuation?.currency ?? null;
    }

    const totalCost = this.calculateTotalCost(dto.quantity, unitCost);

    // ==========================================================
    // DESCONTAR ORIGEN
    // ==========================================================

    sourceInventory.quantity -= dto.quantity;

    await manager.save(Inventory, sourceInventory);

    // ==========================================================
    // INVENTARIO DESTINO
    // ==========================================================

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

    // ==========================================================
    // REGISTRAR TRANSFERENCIA
    // ==========================================================

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      unitCost,

      totalCost,

      currency,

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

    // ==========================================================
    // VALORIZACIÓN DEL AJUSTE DE ENTRADA
    // ==========================================================

    const valuation = this.normalizeExplicitValuation(
      dto.unitCost,
      dto.currency,
    );

    const totalCost = this.calculateTotalCost(dto.quantity, valuation.unitCost);

    inventory.quantity += dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      unitCost: valuation.unitCost,

      totalCost,

      currency: valuation.currency,

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
  //
  // Hereda automáticamente la valorización del inventario.
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

    const valuation = await this.getLatestInventoryValuation(
      manager,
      dto.productId,
      dto.warehouseId,
    );

    const unitCost = valuation?.unitCost ?? null;

    const currency = valuation?.currency ?? null;

    const totalCost = this.calculateTotalCost(dto.quantity, unitCost);

    inventory.quantity -= dto.quantity;

    await manager.save(Inventory, inventory);

    const movement = manager.create(StockMovement, {
      movementType: dto.movementType,

      quantity: dto.quantity,

      unitCost,

      totalCost,

      currency,

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
