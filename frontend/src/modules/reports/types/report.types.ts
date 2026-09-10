export type CostCurrency =
  | "PEN"
  | "USD";

export type ReportGroupBy =
  | "day"
  | "fortnight"
  | "month";

export interface MaterialDispatchFilters {
  from?: string;
  to?: string;
  warehouseId?: number;
  categoryId?: number;
  productId?: number;
  groupBy?: ReportGroupBy;
}

export interface ReportSummary {
  totalPEN: number;
  totalUSD: number;
  pricedItemCount: number;
  unpricedItemCount: number;
}

export interface CategoryReportItem {
  categoryId: number | null;
  categoryName: string;
  totalPEN: number;
  totalUSD: number;
}

export interface MaterialReportItem {
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
