import { api } from "@/services/api";

import type {
  CreateProductDto,
  UpdateProductDto,
  Product,
} from "../types/product.types";

class ProductService {

  /**
   * Obtener todos los productos
   */
  async getAll(): Promise<Product[]> {
    const response = await api.get<Product[]>("/products");

    return response.data;
  }

  /**
   * Obtener un producto por ID
   */
  async getById(id: number): Promise<Product> {
    const response = await api.get<Product>(
      `/products/${id}`
    );

    return response.data;
  }

  /**
   * Crear producto
   */
  async create(
    data: CreateProductDto
  ): Promise<Product> {

    const response = await api.post<Product>(
      "/products",
      data
    );

    return response.data;
  }

  /**
   * Actualizar producto
   */
  async update(
    id: number,
    data: UpdateProductDto
  ): Promise<Product> {

    const response = await api.patch<Product>(
      `/products/${id}`,
      data
    );

    return response.data;
  }

  /**
   * Desactivar producto
   */
  async deactivate(
    id: number
  ): Promise<Product> {

    const response = await api.patch<Product>(
      `/products/${id}/deactivate`
    );

    return response.data;
  }

  /**
   * Activar producto
   */
  async activate(
    id: number
  ): Promise<Product> {

    const response = await api.patch<Product>(
      `/products/${id}/activate`
    );

    return response.data;
  }

}

export const productService =
  new ProductService();