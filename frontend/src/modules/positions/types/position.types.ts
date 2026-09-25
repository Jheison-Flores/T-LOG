export interface Position {
  id: number;

  name: string;

  area?: string;

  description?: string;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreatePositionDto {
  name: string;

  area?: string;

  description?: string;
}

export interface UpdatePositionDto {
  name?: string;

  area?: string;

  description?: string;
}