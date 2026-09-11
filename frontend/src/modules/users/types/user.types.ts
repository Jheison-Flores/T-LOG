import type {
  Role,
} from "@/modules/roles/types/role.types";

import type {
  Warehouse,
} from "@/modules/warehouses/types/warehouse.types";

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  role: Role;
  warehouse?: Warehouse | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  password: string;
  roleId: number;
  warehouseId?: number;
}

export interface UpdateUserDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  roleId?: number;
  warehouseId?: number | null;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
