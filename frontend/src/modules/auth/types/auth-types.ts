export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthRole {
  id: number;
  code: string;
  name: string;
}

export interface AuthWarehouse {
  id: number;
  code?: string;
  name: string;
  type?: string;
  city?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  role: AuthRole;
  warehouse?: AuthWarehouse | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}