import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { MovementType } from '../entities/movement-type.enum';

export class CreateStockMovementDto {
  @IsEnum(MovementType)
  movementType!: MovementType;

  // Producto
  @IsInt()
  @Min(1)
  productId!: number;

  // Cantidad
  @IsInt()
  @Min(1)
  quantity!: number;

  // Entrada / Salida / Ajuste
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  // Transferencia
  @IsOptional()
  @IsInt()
  sourceWarehouseId?: number;

  @IsOptional()
  @IsInt()
  destinationWarehouseId?: number;

  // Información adicional
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
