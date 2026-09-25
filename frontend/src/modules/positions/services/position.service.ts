import {
  api,
} from "@/services/api";

import type {
  CreatePositionDto,
  Position,
  UpdatePositionDto,
} from "../types/position.types";

class PositionService {
  async getAll(): Promise<Position[]> {
    const response =
      await api.get<Position[]>(
        "/positions",
      );

    return response.data;
  }

  async getOne(
    id: number,
  ): Promise<Position> {
    const response =
      await api.get<Position>(
        `/positions/${id}`,
      );

    return response.data;
  }

  async create(
    data: CreatePositionDto,
  ): Promise<Position> {
    const response =
      await api.post<Position>(
        "/positions",
        data,
      );

    return response.data;
  }

  async update(
    id: number,
    data: UpdatePositionDto,
  ): Promise<Position> {
    const response =
      await api.patch<Position>(
        `/positions/${id}`,
        data,
      );

    return response.data;
  }

  async activate(
    id: number,
  ): Promise<Position> {
    const response =
      await api.patch<Position>(
        `/positions/${id}/activate`,
      );

    return response.data;
  }

  async deactivate(
    id: number,
  ): Promise<Position> {
    const response =
      await api.patch<Position>(
        `/positions/${id}/deactivate`,
      );

    return response.data;
  }
}

export const positionService =
  new PositionService();