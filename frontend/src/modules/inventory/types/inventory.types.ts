export interface InventoryCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
}

export interface InventoryProduct {
  id: number;
  sku?: string;
  internalCode?: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  unit: string;
  minimumStock: number;
  requiresSerial: boolean;
  requiresBatch: boolean;
  isActive: boolean;
  category?: InventoryCategory;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryWarehouse {
  id: number;
  code?: string;
  name: string;
  description?: string;
  location?: string;
  isActive?: boolean;
}

export type StockStatus = "ALL" | "OUT" | "LOW" | "NORMAL";

export interface Inventory {
  id: number;
  quantity: number;
  product: InventoryProduct;
  warehouse: InventoryWarehouse;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventorySearchParams {
  search?: string;
  productId?: number;
  warehouseId?: number;
  stockStatus?: StockStatus;
}