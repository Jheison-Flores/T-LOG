import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { MovementType } from '../entities/movement-type.enum';

export class BatchStockMovementDetailDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateBatchStockMovementDto {
  @IsEnum(MovementType)
  movementType!: MovementType;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => BatchStockMovementDetailDto)
  details!: BatchStockMovementDetailDto[];

  // Entrada / Salida / Ajustes
  @IsOptional()
  @IsInt()
  @Min(1)
  warehouseId?: number;

  // Transferencia
  @IsOptional()
  @IsInt()
  @Min(1)
  sourceWarehouseId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  destinationWarehouseId?: number;

  // Información adicional común para todos los productos
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
