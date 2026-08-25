export interface Role {
  id: number;

  code: string;

  name: string;

  description?: string | null;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateRoleDto {
  code: string;

  name: string;

  description?: string;

  isActive?: boolean;
}

export interface UpdateRoleDto {
  code?: string;

  name?: string;

  description?: string;

  isActive?: boolean;
}