export type MovementType =
  | "ENTRY"
  | "OUTPUT"
  | "TRANSFER"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT";

export type CostCurrency =
  | "PEN"
  | "USD";

export interface MovementProduct {
  id: number;
  sku?: string;
  internalCode?: string;
  name: string;
  unit: string;
}

export interface MovementWarehouse {
  id: number;
  code?: string;
  name: string;
}

export interface MovementUser {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface StockMovementInventory {
  id: number;
  quantity: number;
  product?: MovementProduct;
  warehouse?: MovementWarehouse;
}

export interface StockMovement {
  id: number;
  movementType: MovementType;
  quantity: number;
  unitCost?: number | string | null;
  totalCost?: number | string | null;
  currency?: CostCurrency | null;
  reason?: string;
  reference?: string;
  voucherSeries?: string | null;
  voucherPrefix?: "E" | "S" | null;
  voucherNumber?: number | null;
  voucherDate?: string | null;
  voucherPersonnel?: string | null;
  voucherShift?: string | null;
  deliveredBy?: string | null;
  receivedBy?: string | null;
  areaManager?: string | null;
  voucherComments?: string | null;
  sourceInventory?: StockMovementInventory;
  destinationInventory?: StockMovementInventory;
  user: MovementUser;
  createdAt: string;
}

export interface CreateStockMovementDto {
  movementType: MovementType;
  productId: number;
  quantity: number;
  unitCost?: number;
  currency?: CostCurrency;
  warehouseId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  reason?: string;
  reference?: string;
  voucherDate?: string;
  voucherPersonnel?: string;
  voucherShift?: string;
  deliveredBy?: string;
  receivedBy?: string;
  areaManager?: string;
  voucherComments?: string;
}

export interface CreateBatchStockMovementDetailDto {
  productId: number;
  quantity: number;
  unitCost?: number;
  currency?: CostCurrency;
}

export interface CreateBatchStockMovementDto {
  movementType: MovementType;
  details: CreateBatchStockMovementDetailDto[];
  warehouseId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  reason?: string;
  reference?: string;
  voucherDate?: string;
  voucherPersonnel?: string;
  voucherShift?: string;
  deliveredBy?: string;
  receivedBy?: string;
  areaManager?: string;
  voucherComments?: string;
}
