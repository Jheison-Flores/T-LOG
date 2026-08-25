export type WarehouseType =
  | "CENTRAL"
  | "MINE"
  | "WORKSHOP"
  | "OTHER";

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  type: WarehouseType;
  city?: string;
  address?: string;
  manager?: string;
  phone?: string;
  email?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}