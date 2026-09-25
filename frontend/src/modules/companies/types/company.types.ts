export interface Company {
  id: number;

  legalName: string;

  tradeName?: string;

  ruc: string;

  address?: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateCompanyDto {
  legalName: string;

  tradeName?: string;

  ruc: string;

  address?: string;
}

export interface UpdateCompanyDto {
  legalName?: string;

  tradeName?: string;

  ruc?: string;

  address?: string;
}