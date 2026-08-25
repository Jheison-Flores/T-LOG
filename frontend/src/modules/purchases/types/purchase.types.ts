import type {
  Product,
} from "@/modules/products/types/product.types";

import type {
  Supplier,
} from "@/modules/suppliers/types/supplier.types";

import type {
  Request,
} from "@/modules/requests/types/request.types";

export type PurchaseStatus =
  | "REGISTERED"
  | "RECEIVED";

export type PurchaseCurrency =
  | "PEN"
  | "USD";

export interface PurchaseDetail {
  id: number;

  product: Product;

  quantity:
    number |
    string;

  unitPrice:
    number |
    string;

  subtotal:
    number |
    string;

  createdAt?: string;

  updatedAt?: string;
}

export interface PurchaseWarehouse {
  id: number;

  code: string;

  name: string;

  type: string;

  city?: string | null;

  address?: string | null;

  isActive: boolean;
}

export interface PurchaseUser {
  id: number;

  username?: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  role?: {
    id: number;

    code: string;

    name: string;
  };

  warehouse?:
    PurchaseWarehouse |
    null;
}

export interface Purchase {
  id: number;

  purchaseOrderNumber:
    string;

  warehouse?:
    PurchaseWarehouse |
    null;

  request?:
    Request |
    null;

  purchaseDate?:
    string |
    null;

  quotationNumber?:
    string |
    null;

  currency:
    PurchaseCurrency;

  applyIgv:
    boolean;

  subtotalAmount:
    number |
    string;

  igvAmount:
    number |
    string;

  totalAmount:
    number |
    string;

  commercialConditions?:
    string |
    null;

  paymentMethod?:
    string |
    null;

  observation?:
    string |
    null;

  status:
    PurchaseStatus;

  supplier:
    Supplier;

  details:
    PurchaseDetail[];

  createdBy?:
    PurchaseUser |
    null;

  receivedWarehouse?:
    PurchaseWarehouse |
    null;

  receivedBy?:
    PurchaseUser |
    null;

  receivedAt?:
    string |
    null;

  createdAt:
    string;

  updatedAt:
    string;
}

export interface CreatePurchaseDetailDto {
  productId:
    number;

  quantity:
    number;

  unitPrice:
    number;
}

export interface CreatePurchaseDto {
  warehouseId?:
    number;

  requestId?:
    number;

  supplierId:
    number;

  purchaseDate?:
    string;

  quotationNumber?:
    string;

  currency:
    PurchaseCurrency;

  applyIgv?:
    boolean;

  commercialConditions?:
    string;

  paymentMethod?:
    string;

  observation?:
    string;

  details:
    CreatePurchaseDetailDto[];
}

export type UpdatePurchaseDto =
  Partial<CreatePurchaseDto>;

export interface ReceivePurchaseDto {
  warehouseId:
    number;
}