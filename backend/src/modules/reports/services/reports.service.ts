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

interface ReportSummary {
  totalAmount: number;
  guideCount: number;
  totalQuantity: number;
  detailCount: number;
  pricedItemCount: number;
  unpricedItemCount: number;
  coveragePercentage: number;
}

interface WarehouseReportItem {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  guideCount: number;
  detailCount: number;
  totalQuantity: number;
  totalAmount: number;
  unpricedItemCount: number;
}

interface CategoryReportItem {
  categoryId: number | null;
  categoryName: string;
  detailCount: number;
  totalQuantity: number;
  totalAmount: number;
  unpricedItemCount: number;
}

interface ProductReportItem {
  productId: number;
  internalCode: string;
  sku: string;
  productName: string;
  unit: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
  dispatchCount: number;
  unpricedDispatchCount: number;
}

interface TrendReportItem {
  key: string;
  label: string;
  totalAmount: number;
  totalQuantity: number;
  guideCount: number;
  unpricedItemCount: number;
}

interface GuideReportItem {
  guideId: number;
  fullNumber: string;
  transferStartDate: string;
  issueDate: string;
  requestNumber: string;
  destinationWarehouseId: number;
  destinationWarehouseCode: string;
  destinationWarehouseName: string;
  detailCount: number;
  totalQuantity: number;
  totalAmount: number;
  unpricedItemCount: number;
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
  byWarehouse: WarehouseReportItem[];
  byCategory: CategoryReportItem[];
  byProduct: ProductReportItem[];
  trend: TrendReportItem[];
  guides: GuideReportItem[];
}

interface RawDetailRow {
  detail_id: string;
  quantity: string | number | null;
  unit_cost: string | number | null;
  total_cost: string | number | null;

  guide_id: string;
  guide_full_number: string | null;
  guide_transfer_start_date: Date | string | null;
  guide_issue_date: Date | string | null;

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
  // USUARIO
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

  // ============================================================
  // ROLES
  // ============================================================

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
  // FECHAS
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

  private toDateOnly(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);

      if (directMatch) {
        return directMatch[1];
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatDateLabel(dateValue: string): string {
    const [year, month, day] = dateValue.split('-');

    if (!year || !month || !day) {
      return dateValue;
    }

    return `${day}/${month}/${year}`;
  }

  // ============================================================
  // NÚMEROS
  // ============================================================

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

  // ============================================================
  // TENDENCIA
  // ============================================================

  private getTrendKey(
    dateValue: string,
    groupBy: ReportGroupBy,
  ): {
    key: string;
    label: string;
  } {
    const [yearText, monthText, dayText] = dateValue.split('-');

    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      return {
        key: dateValue,
        label: dateValue,
      };
    }

    const monthNames = [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
    ];

    if (groupBy === 'day') {
      return {
        key: dateValue,
        label: this.formatDateLabel(dateValue),
      };
    }

    if (groupBy === 'fortnight') {
      const fortnight = day <= 15 ? 1 : 2;

      return {
        key: `${year}-${String(month).padStart(2, '0')}-Q${fortnight}`,
        label: `${fortnight}ª quincena ${monthNames[month - 1]} ${year}`,
      };
    }

    return {
      key: `${year}-${String(month).padStart(2, '0')}`,
      label: `${monthNames[month - 1]} ${year}`,
    };
  }

  // ============================================================
  // QUERY BASE
  // ============================================================

  private async getRows(
    user: User,
    filter: ReportFilterDto,
  ): Promise<RawDetailRow[]> {
    const query = this.remissionGuideDetailRepository
      .createQueryBuilder('detail')

      .innerJoin('detail.guide', 'guide')

      .innerJoin('guide.request', 'request')

      .innerJoin('guide.destinationWarehouse', 'destinationWarehouse')

      .innerJoin('detail.product', 'product')

      .leftJoin('product.category', 'category')

      .select('detail.id', 'detail_id')

      .addSelect('detail.quantity', 'quantity')

      .addSelect('detail.unitCost', 'unit_cost')

      .addSelect('detail.totalCost', 'total_cost')

      .addSelect('guide.id', 'guide_id')

      .addSelect('guide.fullNumber', 'guide_full_number')

      .addSelect('guide.transferStartDate', 'guide_transfer_start_date')

      .addSelect('guide.issueDate', 'guide_issue_date')

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
    //
    // ADMIN ve todas las minas.
    //
    // LOGISTICS solo puede consultar el valor enviado a su propia
    // unidad, aunque intente enviar otro warehouseId en la URL.
    // ==========================================================

    if (this.isLogistics(user)) {
      query.andWhere('destinationWarehouse.id = :userWarehouseId', {
        userWarehouseId: user.warehouse!.id,
      });
    }

    // ==========================================================
    // FECHAS
    //
    // La fecha oficial del reporte es transferStartDate.
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
    // FILTRO MINA
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
    // FILTRO CATEGORÍA
    // ==========================================================

    if (filter.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    // ==========================================================
    // FILTRO PRODUCTO
    // ==========================================================

    if (filter.productId) {
      query.andWhere('product.id = :productId', {
        productId: filter.productId,
      });
    }

    query
      .orderBy('guide.transferStartDate', 'ASC')
      .addOrderBy('guide.id', 'ASC')
      .addOrderBy('detail.id', 'ASC');

    return query.getRawMany<RawDetailRow>();
  }

  // ============================================================
  // REPORTE PRINCIPAL
  // ============================================================

  async getMaterialDispatchReport(
    userId: number,
    filter: ReportFilterDto,
  ): Promise<MaterialDispatchReport> {
    const user = await this.getUser(userId);

    this.validateCanViewReports(user);

    this.validateDateRange(filter);

    const groupBy = filter.groupBy ?? 'month';

    const rows = await this.getRows(user, filter);

    let totalAmount = 0;
    let totalQuantity = 0;
    let pricedItemCount = 0;
    let unpricedItemCount = 0;

    const guideIds = new Set<number>();

    const warehouses = new Map<number, WarehouseReportItem>();

    const categories = new Map<string, CategoryReportItem>();

    const products = new Map<number, ProductReportItem>();

    const trends = new Map<
      string,
      TrendReportItem & {
        guideIds: Set<number>;
      }
    >();

    const guides = new Map<number, GuideReportItem>();

    for (const row of rows) {
      const detailQuantity = this.number(row.quantity);

      const hasHistoricalCost =
        row.unit_cost !== null &&
        row.unit_cost !== undefined &&
        row.total_cost !== null &&
        row.total_cost !== undefined;

      const detailTotal = hasHistoricalCost ? this.number(row.total_cost) : 0;

      const guideId = Number(row.guide_id);

      const warehouseId = Number(row.warehouse_id);

      const productId = Number(row.product_id);

      const categoryId =
        row.category_id !== null && row.category_id !== undefined
          ? Number(row.category_id)
          : null;

      const categoryName = row.category_name?.trim() || 'SIN CATEGORÍA';

      const transferDate = this.toDateOnly(row.guide_transfer_start_date);

      totalQuantity += detailQuantity;

      totalAmount += detailTotal;

      guideIds.add(guideId);

      if (hasHistoricalCost) {
        pricedItemCount++;
      } else {
        unpricedItemCount++;
      }

      // ========================================================
      // POR MINA
      // ========================================================

      const warehouseCurrent = warehouses.get(warehouseId) ?? {
        warehouseId,
        warehouseCode: row.warehouse_code ?? '',
        warehouseName: row.warehouse_name ?? '',
        guideCount: 0,
        detailCount: 0,
        totalQuantity: 0,
        totalAmount: 0,
        unpricedItemCount: 0,
      };

      warehouseCurrent.detailCount++;

      warehouseCurrent.totalQuantity += detailQuantity;

      warehouseCurrent.totalAmount += detailTotal;

      if (!hasHistoricalCost) {
        warehouseCurrent.unpricedItemCount++;
      }

      warehouses.set(warehouseId, warehouseCurrent);

      // ========================================================
      // POR CATEGORÍA
      // ========================================================

      const categoryKey =
        categoryId !== null ? String(categoryId) : 'NO_CATEGORY';

      const categoryCurrent = categories.get(categoryKey) ?? {
        categoryId,
        categoryName,
        detailCount: 0,
        totalQuantity: 0,
        totalAmount: 0,
        unpricedItemCount: 0,
      };

      categoryCurrent.detailCount++;

      categoryCurrent.totalQuantity += detailQuantity;

      categoryCurrent.totalAmount += detailTotal;

      if (!hasHistoricalCost) {
        categoryCurrent.unpricedItemCount++;
      }

      categories.set(categoryKey, categoryCurrent);

      // ========================================================
      // POR PRODUCTO
      // ========================================================

      const productCurrent = products.get(productId) ?? {
        productId,
        internalCode: row.product_internal_code ?? '',
        sku: row.product_sku ?? '',
        productName: row.product_name ?? '',
        unit: row.product_unit ?? '',
        categoryName,
        totalQuantity: 0,
        totalAmount: 0,
        dispatchCount: 0,
        unpricedDispatchCount: 0,
      };

      productCurrent.totalQuantity += detailQuantity;

      productCurrent.totalAmount += detailTotal;

      productCurrent.dispatchCount++;

      if (!hasHistoricalCost) {
        productCurrent.unpricedDispatchCount++;
      }

      products.set(productId, productCurrent);

      // ========================================================
      // TENDENCIA
      // ========================================================

      const trendInfo = this.getTrendKey(transferDate, groupBy);

      const trendCurrent = trends.get(trendInfo.key) ?? {
        key: trendInfo.key,
        label: trendInfo.label,
        totalAmount: 0,
        totalQuantity: 0,
        guideCount: 0,
        unpricedItemCount: 0,
        guideIds: new Set<number>(),
      };

      trendCurrent.totalAmount += detailTotal;

      trendCurrent.totalQuantity += detailQuantity;

      trendCurrent.guideIds.add(guideId);

      if (!hasHistoricalCost) {
        trendCurrent.unpricedItemCount++;
      }

      trends.set(trendInfo.key, trendCurrent);

      // ========================================================
      // GUÍAS
      // ========================================================

      const guideCurrent = guides.get(guideId) ?? {
        guideId,
        fullNumber: row.guide_full_number ?? '',
        transferStartDate: transferDate,
        issueDate: this.toDateOnly(row.guide_issue_date),
        requestNumber: row.request_number ?? '',
        destinationWarehouseId: warehouseId,
        destinationWarehouseCode: row.warehouse_code ?? '',
        destinationWarehouseName: row.warehouse_name ?? '',
        detailCount: 0,
        totalQuantity: 0,
        totalAmount: 0,
        unpricedItemCount: 0,
      };

      guideCurrent.detailCount++;

      guideCurrent.totalQuantity += detailQuantity;

      guideCurrent.totalAmount += detailTotal;

      if (!hasHistoricalCost) {
        guideCurrent.unpricedItemCount++;
      }

      guides.set(guideId, guideCurrent);
    }

    // ==========================================================
    // CANTIDAD DE GUÍAS POR MINA
    // ==========================================================

    const warehouseGuideMap = new Map<number, Set<number>>();

    for (const row of rows) {
      const warehouseId = Number(row.warehouse_id);

      const guideId = Number(row.guide_id);

      if (!warehouseGuideMap.has(warehouseId)) {
        warehouseGuideMap.set(warehouseId, new Set<number>());
      }

      warehouseGuideMap.get(warehouseId)!.add(guideId);
    }

    for (const [warehouseId, guideSet] of warehouseGuideMap.entries()) {
      const warehouse = warehouses.get(warehouseId);

      if (warehouse) {
        warehouse.guideCount = guideSet.size;
      }
    }

    // ==========================================================
    // NORMALIZAR DECIMALES
    // ==========================================================

    const byWarehouse = Array.from(warehouses.values())
      .map((item) => ({
        ...item,
        totalQuantity: this.quantity(item.totalQuantity),
        totalAmount: this.money(item.totalAmount),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const byCategory = Array.from(categories.values())
      .map((item) => ({
        ...item,
        totalQuantity: this.quantity(item.totalQuantity),
        totalAmount: this.money(item.totalAmount),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const byProduct = Array.from(products.values())
      .map((item) => ({
        ...item,
        totalQuantity: this.quantity(item.totalQuantity),
        totalAmount: this.money(item.totalAmount),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const trend = Array.from(trends.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((item) => ({
        key: item.key,
        label: item.label,
        totalAmount: this.money(item.totalAmount),
        totalQuantity: this.quantity(item.totalQuantity),
        guideCount: item.guideIds.size,
        unpricedItemCount: item.unpricedItemCount,
      }));

    const guideList = Array.from(guides.values())
      .map((item) => ({
        ...item,
        totalQuantity: this.quantity(item.totalQuantity),
        totalAmount: this.money(item.totalAmount),
      }))
      .sort((a, b) => {
        const dateCompare = b.transferStartDate.localeCompare(
          a.transferStartDate,
        );

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return b.guideId - a.guideId;
      });

    const detailCount = rows.length;

    const coveragePercentage =
      detailCount > 0
        ? Number(((pricedItemCount / detailCount) * 100).toFixed(2))
        : 100;

    return {
      filters: {
        from: filter.from ?? null,
        to: filter.to ?? null,
        warehouseId: filter.warehouseId ?? null,
        categoryId: filter.categoryId ?? null,
        productId: filter.productId ?? null,
        groupBy,
      },

      summary: {
        totalAmount: this.money(totalAmount),
        guideCount: guideIds.size,
        totalQuantity: this.quantity(totalQuantity),
        detailCount,
        pricedItemCount,
        unpricedItemCount,
        coveragePercentage,
      },

      byWarehouse,

      byCategory,

      byProduct,

      trend,

      guides: guideList,
    };
  }

  // ============================================================
  // OPCIONES PARA FILTROS DEL FRONTEND
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
