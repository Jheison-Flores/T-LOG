import type { Product } from "@/modules/products/types/product.types";
import type { Warehouse } from "@/modules/warehouses/types/warehouse.types";
import type { Request } from "@/modules/requests/types/request.types";

export type RemissionGuideStatus = "ISSUED" | "CANCELLED";

export type RemissionGuideType =
  | "REQUEST"
  | "MANUAL_WAREHOUSE"
  | "EXTERNAL_SERVICE";

export type TransferReason =
  | "SALE"
  | "PURCHASE"
  | "CONSIGNMENT"
  | "RETURN"
  | "TRANSFORMATION"
  | "BETWEEN_ESTABLISHMENTS"
  | "PICKUP"
  | "ITINERANT_ISSUER"
  | "PRIMARY_ZONE"
  | "IMPORT"
  | "EXPORT"
  | "OTHER";

export interface RemissionGuideUser {
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
  warehouse?: Warehouse | null;
}

export interface RemissionGuideDetail {
  id: number;
  product?: Product | null;
  requestDetail?: {
    id: number;
  } | null;
  description?: string | null;
  unit?: string | null;
  quantity: number | string;
  unitCost?: number | string | null;
  totalCost?: number | string | null;
  totalWeight?: number | string | null;
}

export interface RemissionGuide {
  id: number;
  guideType: RemissionGuideType;
  series: string;
  guideNumber: string;
  fullNumber: string;
  request?: Request | null;
  sourceWarehouse: Warehouse;
  destinationWarehouse?: Warehouse | null;
  issueDate: string;
  transferStartDate: string;
  departurePoint: string;
  arrivalPoint: string;
  recipientName: string;
  recipientRuc?: string | null;
  purchaseOrderReference?: string | null;
  minimumCost?: number | string | null;
  vehicleBrand?: string | null;
  vehiclePlate?: string | null;
  registrationCertificate?: string | null;
  driverLicense?: string | null;
  transportCompanyName?: string | null;
  transportCompanyRuc?: string | null;
  transferReason: TransferReason;
  otherTransferReason?: string | null;
  observations?: string | null;
  status: RemissionGuideStatus;
  createdBy: RemissionGuideUser;
  details: RemissionGuideDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRemissionGuideDetailDto {
  requestDetailId?: number;
  productId?: number;
  description?: string;
  unit?: string;
  quantity: number;
  totalWeight?: number;
}

export interface CreateRemissionGuideDto {
  guideType: RemissionGuideType;
  requestId?: number;
  destinationWarehouseId?: number;
  arrivalPoint?: string;
  recipientName?: string;
  recipientRuc?: string;
  series?: string;
  issueDate?: string;
  transferStartDate: string;
  vehicleBrand?: string;
  vehiclePlate?: string;
  registrationCertificate?: string;
  driverLicense?: string;
  transportCompanyName?: string;
  transportCompanyRuc?: string;
  purchaseOrderReference?: string;
  minimumCost?: number;
  transferReason?: TransferReason;
  otherTransferReason?: string;
  observations?: string;
  details: CreateRemissionGuideDetailDto[];
}