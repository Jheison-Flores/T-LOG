import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import { MovementType } from '../entities/movement-type.enum';

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
  // Si no se proporciona, el movimiento puede quedar
  // sin valorización.
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Min(0)
  unitCost?: number;

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
