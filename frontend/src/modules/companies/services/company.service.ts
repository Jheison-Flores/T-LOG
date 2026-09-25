import {
  api,
} from "@/services/api";

import type {
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
} from "../types/company.types";

class CompanyService {
  // ============================================================
  // LISTAR
  // ============================================================

  async getAll(): Promise<Company[]> {
    const response =
      await api.get<Company[]>(
        "/companies",
      );

    return response.data;
  }

  // ============================================================
  // OBTENER UNA
  // ============================================================

  async getOne(
    id: number,
  ): Promise<Company> {
    const response =
      await api.get<Company>(
        `/companies/${id}`,
      );

    return response.data;
  }

  // ============================================================
  // CREAR
  // ============================================================

  async create(
    data: CreateCompanyDto,
  ): Promise<Company> {
    const response =
      await api.post<Company>(
        "/companies",
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  async update(
    id: number,
    data: UpdateCompanyDto,
  ): Promise<Company> {
    const response =
      await api.patch<Company>(
        `/companies/${id}`,
        data,
      );

    return response.data;
  }

  // ============================================================
  // ACTIVAR
  // ============================================================

  async activate(
    id: number,
  ): Promise<Company> {
    const response =
      await api.patch<Company>(
        `/companies/${id}/activate`,
      );

    return response.data;
  }

  // ============================================================
  // DESACTIVAR
  // ============================================================

  async deactivate(
    id: number,
  ): Promise<Company> {
    const response =
      await api.patch<Company>(
        `/companies/${id}/deactivate`,
      );

    return response.data;
  }
}

export const companyService =
  new CompanyService();