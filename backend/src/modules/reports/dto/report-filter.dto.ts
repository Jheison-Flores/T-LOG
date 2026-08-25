import { Type } from 'class-transformer';

import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export type ReportGroupBy = 'day' | 'fortnight' | 'month';

export class ReportFilterDto {
  // ============================================================
  // RANGO DE FECHAS
  //
  // El reporte utiliza transferStartDate de la Guía de Remisión.
  // ============================================================

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  // ============================================================
  // MINA / ALMACÉN DESTINO
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  warehouseId?: number;

  // ============================================================
  // CATEGORÍA
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  // ============================================================
  // PRODUCTO
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId?: number;

  // ============================================================
  // AGRUPACIÓN DE TENDENCIA
  // ============================================================

  @IsOptional()
  @IsIn(['day', 'fortnight', 'month'])
  groupBy?: ReportGroupBy;
}
