import type {
  Product,
} from "@/modules/products/types/product.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

import type {
  Request,
} from "@/modules/requests/types/request.types";

import type {
  RemissionGuide,
  RemissionGuideDetail,
} from "@/modules/remission-guides/types/remission-guide.types";

// ============================================================
// ESTADO
// ============================================================

export type RouteSheetStatus =
  | "CONFORMING"
  | "WITH_OBSERVATIONS";

// ============================================================
// USUARIO
// ============================================================

export interface RouteSheetUser {
  id:
    number;

  username?:
    string;

  firstName?:
    string;

  lastName?:
    string;

  email?:
    string;

  role?: {
    id:
      number;

    code:
      string;

    name:
      string;
  };

  warehouse?:
    Warehouse | null;
}

// ============================================================
// DETALLE
// ============================================================

export interface RouteSheetDetail {
  id:
    number;

  product:
    Product;

  remissionGuideDetail:
    RemissionGuideDetail;

  sentQuantity:
    number | string;

  receivedQuantity:
    number | string;

  isConforming:
    boolean;

  installationConforming?:
    boolean | null;

  observation?:
    string | null;
}

// ============================================================
// HOJA DE RECORRIDO
// ============================================================

export interface RouteSheet {
  id:
    number;

  routeSheetNumber:
    string;

  remissionGuide:
    RemissionGuide;

  request:
    Request;

  warehouse:
    Warehouse;

  shippingDate:
    string;

  receptionDate:
    string;

  responsibleName:
    string;

  incidentDescription?:
    string | null;

  status:
    RouteSheetStatus;

  createdBy:
    RouteSheetUser;

  details:
    RouteSheetDetail[];

  createdAt:
    string;

  updatedAt:
    string;
}

// ============================================================
// DTO DETALLE
// ============================================================

export interface CreateRouteSheetDetailDto {
  remissionGuideDetailId:
    number;

  receivedQuantity:
    number;

  isConforming:
    boolean;

  installationConforming?:
    boolean;

  observation?:
    string;
}

// ============================================================
// DTO CREAR
// ============================================================

export interface CreateRouteSheetDto {
  remissionGuideId:
    number;

  receptionDate:
    string;

  responsibleName:
    string;

  incidentDescription?:
    string;

  details:
    CreateRouteSheetDetailDto[];
}