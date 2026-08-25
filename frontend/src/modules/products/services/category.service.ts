import { api } from "@/services/api";

import type { Category } from "../types/product.types";

class CategoryService {

  async getAll(): Promise<Category[]> {

    const response = await api.get<Category[]>(
      "/categories"
    );

    return response.data;

  }

}

export const categoryService =
  new CategoryService();