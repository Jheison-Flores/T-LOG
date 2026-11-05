import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import ExcelJS from 'exceljs';

import { Inventory } from '../entities/inventory.entity';

import { Product } from '../../products/entities/product.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { User } from '../../users/entities/user.entity';

import { CreateInventoryDto } from '../dto/create-inventory.dto';

import { UpdateInventoryDto } from '../dto/update-inventory.dto';

import { InventorySearchDto } from '../dto/inventory-search.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ============================================================
  // OBTENER USUARIO
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
  // ACCESO GLOBAL
  // ============================================================

  private hasGlobalAccess(user: User): boolean {
    return user.role.code === 'ADMIN';
  }

  private canSelectWarehouse(user: User): boolean {
    const warehouse = user.warehouse;
    const isCentralWarehouse =
      warehouse?.code?.trim().toUpperCase() === 'LIMA' ||
      warehouse?.city?.trim().toUpperCase().includes('LIMA') === true ||
      warehouse?.name?.trim().toUpperCase().includes('LIMA') === true;

    return this.hasGlobalAccess(user) ||
      (user.role.code === 'LOGISTICS' && isCentralWarehouse);
  }

  // ============================================================
  // VALIDAR WAREHOUSE DE LOGISTICS
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
  // CREAR / REGISTRAR STOCK INICIAL
  //
  // Se conserva para compatibilidad interna.
  // ============================================================

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const { productId, warehouseId, quantity } = createInventoryDto;

    if (quantity < 0) {
      throw new BadRequestException('La cantidad no puede ser negativa.');
    }

    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('El producto no existe.');
    }

    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id: warehouseId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('El almacén no existe.');
    }

    const existing = await this.inventoryRepository.findOne({
      where: {
        product: {
          id: productId,
        },

        warehouse: {
          id: warehouseId,
        },
      },

      relations: {
        product: true,
        warehouse: true,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe un registro de inventario para este producto en este almacén.',
      );
    }

    const inventory = this.inventoryRepository.create({
      product,
      warehouse,
      quantity,
    });

    return this.inventoryRepository.save(inventory);
  }

  // ============================================================
  // LISTAR INVENTARIO
  // ============================================================

  async findAll(
    search: InventorySearchDto,

    userId: number,
  ): Promise<Inventory[]> {
    const user = await this.getAuthenticatedUser(userId);

    const query = this.inventoryRepository
      .createQueryBuilder('inventory')

      .leftJoinAndSelect('inventory.product', 'product')

      .leftJoinAndSelect('inventory.warehouse', 'warehouse')

      .leftJoinAndSelect('product.category', 'category');

    // ==========================================================
    // SEGURIDAD POR WAREHOUSE
    // ==========================================================

    if (this.canSelectWarehouse(user)) {
      /*
       * ADMIN y LOGISTICS desde Lima pueden elegir una unidad
       * para consultar stock en el formulario de movimientos.
       */
      if (search.warehouseId) {
        query.andWhere('warehouse.id = :warehouseId', {
          warehouseId: Number(search.warehouseId),
        });
      }
    } else {
      /*
       * LOGISTICS ignora cualquier warehouseId
       * enviado desde React/Bruno.
       *
       * Siempre utiliza el asignado al usuario.
       */

      const warehouseId = this.getUserWarehouseId(user);

      query.andWhere('warehouse.id = :warehouseId', {
        warehouseId,
      });
    }

    // ==========================================================
    // BÚSQUEDA GENERAL
    // ==========================================================

    if (search.search) {
      query.andWhere(
        `(
          LOWER(product.name) LIKE LOWER(:search)
          OR LOWER(product.sku) LIKE LOWER(:search)
          OR LOWER(product.internalCode) LIKE LOWER(:search)
        )`,
        {
          search: `%${search.search}%`,
        },
      );
    }

    // ==========================================================
    // FILTRAR PRODUCTO
    // ==========================================================

    if (search.productId) {
      query.andWhere('product.id = :productId', {
        productId: Number(search.productId),
      });
    }

    if (search.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: Number(search.categoryId),
      });
    }

    // ==========================================================
    // ESTADO DEL STOCK
    // ==========================================================

    if (search.stockStatus && search.stockStatus !== 'ALL') {
      switch (search.stockStatus) {
        case 'OUT':
          query.andWhere('inventory.quantity = 0');

          break;

        case 'LOW':
          query.andWhere(
            `
              inventory.quantity > 0
              AND inventory.quantity <= product.minimumStock
            `,
          );

          break;

        case 'NORMAL':
          query.andWhere('inventory.quantity > product.minimumStock');

          break;
      }
    }

    // ==========================================================
    // ORDEN
    // ==========================================================

    query.orderBy('product.name', 'ASC');

    query.addOrderBy('warehouse.name', 'ASC');

    return query.getMany();
  }

  async generateExcel(search: InventorySearchDto, userId: number): Promise<Buffer> {
    const inventory = await this.findAll(search, userId);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TEINCOMIN';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Inventario');
    worksheet.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }];
    worksheet.columns = [
      { header: 'Producto', key: 'product', width: 36 },
      { header: 'Código interno', key: 'internalCode', width: 20 },
      { header: 'SKU', key: 'sku', width: 18 },
      { header: 'Almacén', key: 'warehouse', width: 28 },
      { header: 'Categoría', key: 'category', width: 24 },
      { header: 'Unidad', key: 'unit', width: 14 },
      { header: 'Stock actual', key: 'quantity', width: 16 },
      { header: 'Stock mínimo', key: 'minimumStock', width: 16 },
      { header: 'Estado', key: 'status', width: 18 },
    ];

    const header = worksheet.getRow(1);
    header.height = 28;
    header.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26364A' } };
    });

    worksheet.addRows(inventory.map((item) => {
      const quantity = Number(item.quantity);
      const minimumStock = Number(item.product?.minimumStock ?? 0);
      const status = quantity <= 0
        ? 'SIN STOCK'
        : quantity <= minimumStock
          ? 'STOCK BAJO'
          : 'NORMAL';

      return {
        product: item.product?.name ?? '',
        internalCode: item.product?.internalCode ?? '',
        sku: item.product?.sku ?? '',
        warehouse: item.warehouse?.name ?? '',
        category: item.product?.category?.name ?? 'Sin categoría',
        unit: item.product?.unit ?? '',
        quantity,
        minimumStock,
        status,
      };
    }));

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.height = 22;
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Arial', size: 10, color: { argb: 'FF111827' } };
        cell.alignment = { vertical: 'middle' };
        cell.border = { bottom: { style: 'hair', color: { argb: 'FFD1D5DB' } } };
        if (rowNumber % 2 === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        }
      });
      row.getCell(7).numFmt = '#,##0.###';
      row.getCell(8).numFmt = '#,##0.###';
    });

    worksheet.autoFilter = {
      from: 'A1',
      to: `I${Math.max(1, inventory.length + 1)}`,
    };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  // ============================================================
  // OBTENER INVENTARIO POR ID
  // ============================================================

  async findOne(id: number, userId?: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        id,
      },

      relations: {
        product: {
          category: true,
        },

        warehouse: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException('El registro de inventario no existe.');
    }

    /*
     * Cuando findOne se utiliza internamente sin userId,
     * mantenemos compatibilidad con los métodos actuales.
     */

    if (userId !== undefined) {
      const user = await this.getAuthenticatedUser(userId);

      if (!this.hasGlobalAccess(user)) {
        const warehouseId = this.getUserWarehouseId(user);

        if (inventory.warehouse.id !== warehouseId) {
          throw new NotFoundException('El registro de inventario no existe.');
        }
      }
    }

    return inventory;
  }

  // ============================================================
  // PRODUCTO + WAREHOUSE
  // ============================================================

  async findByProductAndWarehouse(
    productId: number,
    warehouseId: number,
  ): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: {
        product: {
          id: productId,
        },

        warehouse: {
          id: warehouseId,
        },
      },

      relations: {
        product: {
          category: true,
        },

        warehouse: true,
      },
    });

    if (!inventory) {
      throw new NotFoundException(
        'No existe inventario para este producto en este almacén.',
      );
    }

    return inventory;
  }

  // ============================================================
  // ACTUALIZAR STOCK MANUALMENTE
  //
  // Se mantiene por compatibilidad.
  // Los movimientos deberían seguir siendo el mecanismo normal.
  // ============================================================

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id);

    if (
      updateInventoryDto.quantity !== undefined &&
      updateInventoryDto.quantity < 0
    ) {
      throw new BadRequestException('La cantidad no puede ser negativa.');
    }

    if (updateInventoryDto.quantity !== undefined) {
      inventory.quantity = updateInventoryDto.quantity;
    }

    return this.inventoryRepository.save(inventory);
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async remove(id: number): Promise<void> {
    const inventory = await this.findOne(id);

    await this.inventoryRepository.remove(inventory);
  }

  // ============================================================
  // STOCK TOTAL PRODUCTO
  // ============================================================

  async getTotalStockByProduct(
    productId: number,
    userId: number,
  ): Promise<number> {
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('El producto no existe.');
    }

    const user = await this.getAuthenticatedUser(userId);

    const query = this.inventoryRepository
      .createQueryBuilder('inventory')

      .select('COALESCE(SUM(inventory.quantity), 0)', 'total')

      .where('inventory.product_id = :productId', {
        productId,
      });

    /*
     * LOGISTICS suma solamente su warehouse.
     */

    if (!this.hasGlobalAccess(user)) {
      const warehouseId = this.getUserWarehouseId(user);

      query.andWhere('inventory.warehouse_id = :warehouseId', {
        warehouseId,
      });
    }

    const result = await query.getRawOne<{
      total: string | number;
    }>();

    return Number(result?.total ?? 0);
  }

  // ============================================================
  // STOCK TOTAL WAREHOUSE
  // ============================================================

  async getTotalStockByWarehouse(
    warehouseId: number,
    userId: number,
  ): Promise<number> {
    const user = await this.getAuthenticatedUser(userId);

    /*
     * LOGISTICS solo puede consultar su propio warehouse.
     */

    if (!this.hasGlobalAccess(user)) {
      const userWarehouseId = this.getUserWarehouseId(user);

      if (warehouseId !== userWarehouseId) {
        throw new NotFoundException('Almacén no encontrado.');
      }
    }

    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id: warehouseId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('El almacén no existe.');
    }

    const result = await this.inventoryRepository
      .createQueryBuilder('inventory')

      .select('COALESCE(SUM(inventory.quantity), 0)', 'total')

      .where('inventory.warehouse_id = :warehouseId', {
        warehouseId,
      })

      .getRawOne<{
        total: string | number;
      }>();

    return Number(result?.total ?? 0);
  }
}
