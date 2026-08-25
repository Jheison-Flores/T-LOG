import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { PurchaseCurrency } from '../entities/purchase-currency.enum';

// ============================================================
// DETALLE
// ============================================================

export class CreatePurchaseDetailDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  unitPrice!: number;
}

// ============================================================
// CABECERA
// ============================================================

export class CreatePurchaseDto {
  // ==========================================================
  // UNIDAD
  //
  // ADMIN selecciona.
  // LOGISTICS usa automáticamente su warehouse.
  // ==========================================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  warehouseId?: number;

  // ==========================================================
  // REQUERIMIENTO
  // ==========================================================

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestId?: number;

  // ==========================================================
  // PROVEEDOR
  // ==========================================================

  @Type(() => Number)
  @IsInt()
  @Min(1)
  supplierId!: number;

  // ==========================================================
  // FECHA
  // ==========================================================

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  // ==========================================================
  // COTIZACIÓN
  // ==========================================================

  @IsOptional()
  @IsString()
  @MaxLength(100)
  quotationNumber?: string;

  // ==========================================================
  // MONEDA
  // ==========================================================

  @IsEnum(PurchaseCurrency)
  currency!: PurchaseCurrency;

  // ==========================================================
  // IGV
  // ==========================================================

  @IsOptional()
  @IsBoolean()
  applyIgv?: boolean;

  // ==========================================================
  // CONDICIONES
  // ==========================================================

  @IsOptional()
  @IsString()
  commercialConditions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  paymentMethod?: string;

  // ==========================================================
  // OBSERVACIÓN
  // ==========================================================

  @IsOptional()
  @IsString()
  observation?: string;

  // ==========================================================
  // DETALLES
  // ==========================================================

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreatePurchaseDetailDto)
  details!: CreatePurchaseDetailDto[];
}
