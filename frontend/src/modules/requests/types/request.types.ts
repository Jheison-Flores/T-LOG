import type {
  Product,
} from "@/modules/products/types/product.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

// ============================================================
// ESTADOS
// ============================================================

export type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PARTIAL"
  | "IN_PROGRESS"
  | "DELIVERED";

// ============================================================
// USUARIO
// ============================================================

export interface RequestUser {
  id: number;

  username: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  role?: {
    id: number;

    code: string;

    name: string;
  };

  warehouse?:
    | Warehouse
    | null;
}

// ============================================================
// DETALLE DEL REQUERIMIENTO
// ============================================================

export interface RequestDetail {
  id: number;

  product:
    Product;

  quantity:
    | number
    | string;

  approvedQuantity:
    | number
    | string;

  deliveredQuantity:
    | number
    | string;

  observations?:
    | string
    | null;
}

// ============================================================
// DESPACHOS HISTÓRICOS
//
// Se conservan porque existen registros anteriores.
// Ya no se crean desde la pantalla de Requerimientos.
// ============================================================

export interface RequestDispatchDetail {
  id: number;

  product:
    Product;

  quantity:
    | number
    | string;

  requestDetail?: {
    id: number;
  };
}

export interface RequestDispatch {
  id: number;

  dispatchNumber:
    string;

  sourceWarehouse:
    Warehouse;

  destinationWarehouse:
    Warehouse;

  createdBy:
    RequestUser;

  observations?:
    | string
    | null;

  details:
    RequestDispatchDetail[];

  createdAt:
    string;
}

// ============================================================
// REQUERIMIENTO
// ============================================================

export interface Request {
  id: number;

  requestNumber:
    string;

  requester:
    string;

  destination?:
    | string
    | null;

  attention?:
    | string
    | null;

  observations?:
    | string
    | null;

  status:
    RequestStatus;

  warehouse:
    Warehouse;

  createdBy:
    RequestUser;

  reviewedBy?:
    | RequestUser
    | null;

  reviewedAt?:
    | string
    | null;

  approvedBy?:
    | RequestUser
    | null;

  approvedAt?:
    | string
    | null;

  rejectionReason?:
    | string
    | null;

  details:
    RequestDetail[];

  dispatches?:
    RequestDispatch[];

  createdAt:
    string;

  updatedAt:
    string;
}

// ============================================================
// CREAR
// ============================================================

export interface CreateRequestDetailDto {
  productId:
    number;

  quantity:
    number;

  observations?:
    string;
}

export interface CreateRequestDto {
  requester:
    string;

  warehouseId?:
    number;

  observations?:
    string;

  details:
    CreateRequestDetailDto[];
}

// ============================================================
// APROBAR
// ============================================================

export interface ApproveRequestDetailDto {
  detailId:
    number;

  approvedQuantity:
    number;
}

export interface ApproveRequestDto {
  details:
    ApproveRequestDetailDto[];

  observations?:
    string;
}

// ============================================================
// RECHAZAR
// ============================================================

export interface RejectRequestDto {
  reason:
    string;
}

// ============================================================
// DESPACHAR
// ============================================================

export interface DeliverRequestDetailDto {
  detailId:
    number;

  quantity:
    number;
}

export interface DeliverRequestDto {
  sourceWarehouseId:
    number;

  details:
    DeliverRequestDetailDto[];

  observations?:
    string;
}