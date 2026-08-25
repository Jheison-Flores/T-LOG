export type CategoryColor =
  | "BLUE"
  | "GREEN"
  | "RED"
  | "YELLOW"
  | "ORANGE"
  | "PURPLE"
  | "GRAY";

export interface Category {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  color: CategoryColor;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  color?: CategoryColor;
  icon?: string;
}

export interface UpdateCategoryDto {
  code?: string;
  name?: string;
  description?: string;
  color?: CategoryColor;
  icon?: string;
}