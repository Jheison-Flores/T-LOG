import type {
  Category,
} from "@/modules/categories/types/category.types";

export type {
  Category,
} from "@/modules/categories/types/category.types";

export type ProductUnit =
  | "Unidad"
  | "Par"
  | "Juego"
  | "Paquete"
  | "Caja"
  | "Bolsa"
  | "Rollo"
  | "Docena"
  | "Metro"
  | "Kilogramo"
  | "Litro";

export const PRODUCT_UNIT_OPTIONS: {
  value: ProductUnit;
  label: string;
}[] = [
  {
    value: "Unidad",
    label: "Unidad",
  },
  {
    value: "Par",
    label: "Par",
  },
  {
    value: "Juego",
    label: "Juego",
  },
  {
    value: "Paquete",
    label: "Paquete",
  },
  {
    value: "Caja",
    label: "Caja",
  },
  {
    value: "Bolsa",
    label: "Bolsa",
  },
  {
    value: "Rollo",
    label: "Rollo",
  },
  {
    value: "Docena",
    label: "Docena",
  },
  {
    value: "Metro",
    label: "Metro",
  },
  {
    value: "Kilogramo",
    label: "Kilogramo",
  },
  {
    value: "Litro",
    label: "Litro",
  },
];

export interface Product {
  id: number;

  sku?: string | null;

  internalCode?: string | null;

  name: string;

  description?: string | null;

  brand?: string | null;

  model?: string | null;

  unit: ProductUnit;

  minimumStock: number;

  currentPrice?: number | null;

  requiresSerial: boolean;

  requiresBatch: boolean;

  isActive: boolean;

  category: Category;

  createdAt: string;

  updatedAt: string;
}

export interface CreateProductDto {
  sku?: string;

  internalCode?: string;

  name: string;

  description?: string;

  brand?: string;

  model?: string;

  unit: ProductUnit;

  minimumStock: number;

  currentPrice?: number;

  requiresSerial: boolean;

  requiresBatch: boolean;

  categoryId: number;
}

export interface UpdateProductDto {
  sku?: string;

  internalCode?: string;

  name?: string;

  description?: string;

  brand?: string;

  model?: string;

  unit?: ProductUnit;

  minimumStock?: number;

  currentPrice?: number;

  requiresSerial?: boolean;

  requiresBatch?: boolean;

  categoryId?: number;
}