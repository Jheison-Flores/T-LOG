import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { MovementType } from '../entities/movement-type.enum';

export type BatchStockMovementCurrency = 'PEN' | 'USD';

export class BatchStockMovementDetailDto {
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
  // Opcional e independiente por cada producto.
  //
  // Ejemplo:
  //
  // Producto A = S/ 10.50
  // Producto B = US$ 22.00
  // Producto C = sin precio
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Min(0)
  unitCost?: number;

  // ============================================================
  // MONEDA
  //
  // Cada producto tiene una sola moneda.
  //
  // PEN = Soles
  // USD = Dólares
  // ============================================================

  @IsOptional()
  @IsIn(['PEN', 'USD'])
  currency?: BatchStockMovementCurrency;
}

export class CreateBatchStockMovementDto {
  // ============================================================
  // TIPO
  // ============================================================

  @IsEnum(MovementType)
  movementType!: MovementType;

  // ============================================================
  // DETALLES
  // ============================================================

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => BatchStockMovementDetailDto)
  details!: BatchStockMovementDetailDto[];

  // ============================================================
  // ENTRADA / SALIDA / AJUSTES
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
  // INFORMACIÓN ADICIONAL COMÚN
  // ============================================================

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
