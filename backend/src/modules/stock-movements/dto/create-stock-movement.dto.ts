import {
  IsIn,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import { MovementType } from '../entities/movement-type.enum';

export type StockMovementCurrency = 'PEN' | 'USD';

export class CreateStockMovementDto {
  @IsEnum(MovementType)
  movementType!: MovementType;

  // ============================================================
  // PRODUCTO
  // ============================================================

  @IsInt()
  @Min(1)
  productId!: number;

  // ============================================================
  // CANTIDAD
  // ============================================================

  @IsInt()
  @Min(1)
  quantity!: number;

  // ============================================================
  // PRECIO UNITARIO
  //
  // Opcional.
  //
  // Se utiliza principalmente en:
  // - ENTRY
  // - ADJUSTMENT_IN
  //
  // También puede ser utilizado internamente por TRANSFER para
  // conservar exactamente la valorización de una Guía.
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Min(0)
  unitCost?: number;

  // ============================================================
  // MONEDA DEL PRECIO
  //
  // PEN = Soles
  // USD = Dólares
  //
  // La validación de negocio precio ↔ moneda se realizará en el
  // StockMovementsService.
  // ============================================================

  @IsOptional()
  @IsIn(['PEN', 'USD'])
  currency?: StockMovementCurrency;

  // ============================================================
  // ENTRADA / SALIDA / AJUSTE
  // ============================================================

  @IsOptional()
  @IsInt()
  @Min(1)
  warehouseId?: number;

  // ============================================================
  // TRANSFERENCIA
  // ============================================================

  @IsOptional()
  @IsInt()
  @Min(1)
  sourceWarehouseId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  destinationWarehouseId?: number;

  // ============================================================
  // INFORMACIÓN ADICIONAL
  // ============================================================

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
