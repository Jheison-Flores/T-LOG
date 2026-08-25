export interface Supplier {
  id: number;

  name: string;

  ruc?: string | null;

  address?: string | null;

  phone?: string | null;

  email?: string | null;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;

  ruc?: string;

  address?: string;

  phone?: string;

  email?: string;

  isActive?: boolean;
}

export type UpdateSupplierDto =
  Partial<CreateSupplierDto>;