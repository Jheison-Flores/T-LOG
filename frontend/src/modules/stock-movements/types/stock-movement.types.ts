export type MovementType =
  | "ENTRY"
  | "OUTPUT"
  | "TRANSFER"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT";

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
  reason?: string;
  reference?: string;
  sourceInventory?: StockMovementInventory;
  destinationInventory?: StockMovementInventory;
  user: MovementUser;
  createdAt: string;
}

export interface CreateStockMovementDto {
  movementType: MovementType;
  productId: number;
  quantity: number;
  warehouseId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  reason?: string;
  reference?: string;
}

export interface CreateBatchStockMovementDetailDto {
  productId: number;
  quantity: number;
}

export interface CreateBatchStockMovementDto {
  movementType: MovementType;
  details: CreateBatchStockMovementDetailDto[];
  warehouseId?: number;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  reason?: string;
  reference?: string;
}