export type ReportGroupBy = "day" | "fortnight" | "month";

export interface MaterialDispatchFilters {
  from?: string;
  to?: string;
  warehouseId?: number;
  categoryId?: number;
  productId?: number;
  groupBy?: ReportGroupBy;
}

export interface ReportSummary {
  totalAmount: number;
  guideCount: number;
  totalQuantity: number;
  detailCount: number;
  pricedItemCount: number;
  unpricedItemCount: number;
  coveragePercentage: number;
}

export interface WarehouseReportItem {
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  guideCount: number;
  detailCount: number;
  totalQuantity: number;
  totalAmount: number;
  unpricedItemCount: number;
}

export interface CategoryReportItem {
  categoryId: number | null;
  categoryName: string;
  detailCount: number;
  totalQuantity: number;
  totalAmount: number;
  unpricedItemCount: number;
}

export interface ProductReportItem {
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

export interface TrendReportItem {
  key: string;
  label: string;
  totalAmount: number;
  totalQuantity: number;
  guideCount: number;
  unpricedItemCount: number;
}

export interface GuideReportItem {
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

export interface ReportFilterOption {
  id: number;
  name: string;
  code?: string;
}

export interface MaterialDispatchFilterOptions {
  warehouses: ReportFilterOption[];
  categories: ReportFilterOption[];
  products: ReportFilterOption[];
}