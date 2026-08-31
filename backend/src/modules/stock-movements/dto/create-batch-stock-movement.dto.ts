import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { MovementType } from '../entities/movement-type.enum';

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
  // Esto permite registrar una entrada múltiple donde:
  //
  // Producto A = S/ 10.50
  // Producto B = S/ 22.00
  // Producto C = sin precio
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 4,
  })
  @Min(0)
  unitCost?: number;
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
