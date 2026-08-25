import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

import { Unit } from '../entities/unit.enum';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsEnum(Unit)
  unit!: Unit;

  @IsInt()
  @Min(0)
  minimumStock!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentPrice?: number;

  @IsBoolean()
  requiresSerial!: boolean;

  @IsBoolean()
  requiresBatch!: boolean;

  @IsInt()
  @Min(1)
  categoryId!: number;
}
