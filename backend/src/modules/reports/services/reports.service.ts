import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { RemissionGuideDetail } from '../../remission-guides/entities/remission-guide-detail.entity';

import { User } from '../../users/entities/user.entity';

import { ReportFilterDto, ReportGroupBy } from '../dto/report-filter.dto';

type CostCurrency = 'PEN' | 'USD';

interface ReportSummary {
  totalPEN: number;
  totalUSD: number;
  pricedItemCount: number;
  unpricedItemCount: number;
}
interface CategoryReportItem {
  categoryId: number | null;
  categoryName: string;
  totalPEN: number;
  totalUSD: number;
}

interface MaterialReportItem {
  detailId: number;
  productId: number;
  internalCode: string;
  sku: string;
  productName: string;
  categoryName: string;
  unit: string;
  quantity: number;
  currency: CostCurrency | null;
  unitCost: number | null;
  totalAmount: number | null;
}

export interface FilterOption {
  id: number;
  name: string;
  code?: string;
}

export interface MaterialDispatchFilterOptions {
  warehouses: FilterOption[];
  categories: FilterOption[];
  products: FilterOption[];
}

export interface MaterialDispatchReport {
  filters: {
    from: string | null;
    to: string | null;
    warehouseId: number | null;
    categoryId: number | null;
    productId: number | null;
    groupBy: ReportGroupBy;
  };

  summary: ReportSummary;

  byCategory: CategoryReportItem[];

  materials: MaterialReportItem[];
}

interface RawDetailRow {
  detail_id: string;
  quantity: string | number | null;
  unit_cost: string | number | null;
  total_cost: string | number | null;
  currency: string | null;

  guide_id: string;
  guide_transfer_start_date: Date | string | null;

  request_number: string | null;

  warehouse_id: string;
  warehouse_code: string | null;
  warehouse_name: string | null;

  product_id: string;
  product_name: string | null;
  product_internal_code: string | null;
  product_sku: string | null;
  product_unit: string | null;

  category_id: string | null;
  category_name: string | null;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(RemissionGuideDetail)
    private readonly remissionGuideDetailRepository: Repository<RemissionGuideDetail>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ============================================================
  // USUARIO Y PERMISOS
  // ============================================================

  private async getUser(userId: number): Promise<User> {
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
      throw new ForbiddenException('El usuario se encuentra inactivo.');
    }

    return user;
  }

  private isAdmin(user: User): boolean {
    return user.role?.code === 'ADMIN';
  }

  private isLogistics(user: User): boolean {
    return user.role?.code === 'LOGISTICS';
  }

  private validateCanViewReports(user: User): void {
    if (!this.isAdmin(user) && !this.isLogistics(user)) {
      throw new ForbiddenException(
        'No tienes permisos para consultar reportes gerenciales.',
      );
    }

    if (this.isLogistics(user) && !user.warehouse) {
      throw new BadRequestException(
        'El usuario LOGISTICS no tiene una mina o almacén asignado.',
      );
    }
  }

  // ============================================================
  // VALIDACIONES Y CONVERSIÓN
  // ============================================================

  private validateDateRange(filter: ReportFilterDto): void {
    if (!filter.from || !filter.to) {
      return;
    }

    const from = new Date(`${filter.from}T00:00:00`);
    const to = new Date(`${filter.to}T00:00:00`);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('El rango de fechas no es válido.');
    }

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }
  }

  private number(value: unknown): number {
    const parsed = Number(value ?? 0);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private money(value: number): number {
    return Number(value.toFixed(2));
  }

  private quantity(value: number): number {
    return Number(value.toFixed(2));
  }

  private normalizeCurrency(value: unknown): CostCurrency | null {
    const currency = String(value ?? '')
      .trim()
      .toUpperCase();

    if (currency === 'PEN' || currency === 'USD') {
      return currency;
    }

    return null;
  }

  // ============================================================
  // QUERY BASE
  //
  // IMPORTANTE:
  // - REQUEST puede tener requerimiento.
  // - MANUAL_WAREHOUSE no tiene requerimiento.
  // Por eso guide.request debe ser LEFT JOIN.
  // ============================================================

  private async getRows(
    user: User,
    filter: ReportFilterDto,
  ): Promise<RawDetailRow[]> {
    const query = this.remissionGuideDetailRepository
      .createQueryBuilder('detail')

      .innerJoin('detail.guide', 'guide')

      .leftJoin('guide.request', 'request')

      .innerJoin('guide.destinationWarehouse', 'destinationWarehouse')

      .innerJoin('detail.product', 'product')

      .leftJoin('product.category', 'category')

      .select('detail.id', 'detail_id')

      .addSelect('detail.quantity', 'quantity')

      .addSelect('detail.unitCost', 'unit_cost')

      .addSelect('detail.totalCost', 'total_cost')

      .addSelect('detail.currency', 'currency')

      .addSelect('guide.id', 'guide_id')

      .addSelect('guide.transferStartDate', 'guide_transfer_start_date')

      .addSelect('request.requestNumber', 'request_number')

      .addSelect('destinationWarehouse.id', 'warehouse_id')

      .addSelect('destinationWarehouse.code', 'warehouse_code')

      .addSelect('destinationWarehouse.name', 'warehouse_name')

      .addSelect('product.id', 'product_id')

      .addSelect('product.name', 'product_name')

      .addSelect('product.internalCode', 'product_internal_code')

      .addSelect('product.sku', 'product_sku')

      .addSelect('product.unit', 'product_unit')

      .addSelect('category.id', 'category_id')

      .addSelect('category.name', 'category_name');

    // ==========================================================
    // SEGURIDAD
    // ==========================================================

    if (this.isLogistics(user)) {
      query.andWhere('destinationWarehouse.id = :userWarehouseId', {
        userWarehouseId: user.warehouse!.id,
      });
    }

    // ==========================================================
    // FECHAS
    // ==========================================================

    if (filter.from) {
      query.andWhere('DATE(guide.transferStartDate) >= :from', {
        from: filter.from,
      });
    }

    if (filter.to) {
      query.andWhere('DATE(guide.transferStartDate) <= :to', {
        to: filter.to,
      });
    }

    // ==========================================================
    // MINA / ALMACÉN
    // ==========================================================

    if (filter.warehouseId) {
      const requestedWarehouseId = Number(filter.warehouseId);

      if (
        !Number.isInteger(requestedWarehouseId) ||
        requestedWarehouseId <= 0
      ) {
        throw new BadRequestException('La unidad seleccionada no es válida.');
      }

      if (
        this.isLogistics(user) &&
        requestedWarehouseId !== user.warehouse!.id
      ) {
        throw new ForbiddenException(
          'Solo puedes consultar reportes de tu propia unidad.',
        );
      }

      query.andWhere('destinationWarehouse.id = :warehouseId', {
        warehouseId: requestedWarehouseId,
      });
    }

    // ==========================================================
    // CATEGORÍA
    // ==========================================================

    if (filter.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    // ==========================================================
    // PRODUCTO
    // ==========================================================

    if (filter.productId) {
      query.andWhere('product.id = :productId', {
        productId: filter.productId,
      });
    }

    query
      .orderBy('guide.transferStartDate', 'DESC')
      .addOrderBy('guide.id', 'DESC')
      .addOrderBy('detail.id', 'DESC');

    return query.getRawMany<RawDetailRow>();
  }

  // ============================================================
  // REPORTE PRINCIPAL SIMPLIFICADO
  // ============================================================

  async getMaterialDispatchReport(
    userId: number,
    filter: ReportFilterDto,
  ): Promise<MaterialDispatchReport> {
    const user = await this.getUser(userId);

    this.validateCanViewReports(user);

    this.validateDateRange(filter);

    const rows = await this.getRows(user, filter);

    let totalPEN = 0;
    let totalUSD = 0;

    let pricedItemCount = 0;
    let unpricedItemCount = 0;

    const categoryMap = new Map<string, CategoryReportItem>();

    const materials: MaterialReportItem[] = [];

    for (const row of rows) {
      const quantity = this.number(row.quantity);

      const unitCost =
        row.unit_cost !== null && row.unit_cost !== undefined
          ? this.number(row.unit_cost)
          : null;

      const totalAmount =
        row.total_cost !== null && row.total_cost !== undefined
          ? this.number(row.total_cost)
          : null;

      const currency = this.normalizeCurrency(row.currency);

      const hasValuation =
        unitCost !== null && totalAmount !== null && currency !== null;

      if (hasValuation) {
        pricedItemCount++;

        if (currency === 'PEN') {
          totalPEN += totalAmount;
        }

        if (currency === 'USD') {
          totalUSD += totalAmount;
        }
      } else {
        unpricedItemCount++;
      }

      const categoryId =
        row.category_id !== null && row.category_id !== undefined
          ? Number(row.category_id)
          : null;

      const categoryName = row.category_name?.trim() || 'SIN CATEGORÍA';

      const categoryKey =
        categoryId !== null ? String(categoryId) : 'NO_CATEGORY';

      const categoryCurrent = categoryMap.get(categoryKey) ?? {
        categoryId,
        categoryName,
        totalPEN: 0,
        totalUSD: 0,
      };

      if (hasValuation && currency === 'PEN') {
        categoryCurrent.totalPEN += totalAmount;
      }

      if (hasValuation && currency === 'USD') {
        categoryCurrent.totalUSD += totalAmount;
      }

      categoryMap.set(categoryKey, categoryCurrent);

      materials.push({
        detailId: Number(row.detail_id),

        productId: Number(row.product_id),

        internalCode: row.product_internal_code ?? '',

        sku: row.product_sku ?? '',

        productName: row.product_name ?? '',

        categoryName,

        unit: row.product_unit ?? '',

        quantity: this.quantity(quantity),

        currency,

        unitCost: hasValuation ? this.money(unitCost) : null,

        totalAmount: hasValuation ? this.money(totalAmount) : null,
      });
    }

    const byCategory = Array.from(categoryMap.values())
      .map((item) => ({
        ...item,

        totalPEN: this.money(item.totalPEN),

        totalUSD: this.money(item.totalUSD),
      }))
      .sort((a, b) => b.totalPEN + b.totalUSD - (a.totalPEN + a.totalUSD));

    return {
      filters: {
        from: filter.from ?? null,

        to: filter.to ?? null,

        warehouseId: filter.warehouseId ?? null,

        categoryId: filter.categoryId ?? null,

        productId: filter.productId ?? null,

        groupBy: filter.groupBy ?? 'month',
      },

      summary: {
        totalPEN: this.money(totalPEN),

        totalUSD: this.money(totalUSD),

        pricedItemCount,

        unpricedItemCount,
      },

      byCategory,

      materials,
    };
  }

  // ============================================================
  // OPCIONES PARA FILTROS
  // ============================================================

  async getMaterialDispatchFilterOptions(
    userId: number,
  ): Promise<MaterialDispatchFilterOptions> {
    const user = await this.getUser(userId);

    this.validateCanViewReports(user);

    const query = this.remissionGuideDetailRepository
      .createQueryBuilder('detail')

      .innerJoin('detail.guide', 'guide')

      .innerJoin('guide.destinationWarehouse', 'destinationWarehouse')

      .innerJoin('detail.product', 'product')

      .leftJoin('product.category', 'category')

      .select('destinationWarehouse.id', 'warehouse_id')

      .addSelect('destinationWarehouse.code', 'warehouse_code')

      .addSelect('destinationWarehouse.name', 'warehouse_name')

      .addSelect('product.id', 'product_id')

      .addSelect('product.name', 'product_name')

      .addSelect('category.id', 'category_id')

      .addSelect('category.name', 'category_name');

    if (this.isLogistics(user)) {
      query.andWhere('destinationWarehouse.id = :userWarehouseId', {
        userWarehouseId: user.warehouse!.id,
      });
    }

    const rows = await query.getRawMany<{
      warehouse_id: string;
      warehouse_code: string | null;
      warehouse_name: string | null;

      product_id: string;
      product_name: string | null;

      category_id: string | null;
      category_name: string | null;
    }>();

    const warehouseMap = new Map<number, FilterOption>();

    const categoryMap = new Map<number, FilterOption>();

    const productMap = new Map<number, FilterOption>();

    for (const row of rows) {
      const warehouseId = Number(row.warehouse_id);

      if (!warehouseMap.has(warehouseId)) {
        warehouseMap.set(warehouseId, {
          id: warehouseId,

          code: row.warehouse_code ?? '',

          name: row.warehouse_name ?? '',
        });
      }

      if (row.category_id !== null && row.category_id !== undefined) {
        const categoryId = Number(row.category_id);

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: categoryId,

            name: row.category_name ?? '',
          });
        }
      }

      const productId = Number(row.product_id);

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: productId,

          name: row.product_name ?? '',
        });
      }
    }

    return {
      warehouses: Array.from(warehouseMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),

      categories: Array.from(categoryMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),

      products: Array.from(productMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };
  }
}
