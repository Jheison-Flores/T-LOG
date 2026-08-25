import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

// ============================================================
// DETALLE
// ============================================================

export class CreateRouteSheetDetailDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  remissionGuideDetailId!: number;

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  receivedQuantity!: number;

  @IsBoolean()
  isConforming!: boolean;

  @IsOptional()
  @IsBoolean()
  installationConforming?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observation?: string;
}

// ============================================================
// CABECERA
// ============================================================

export class CreateRouteSheetDto {
  // ==========================================================
  // GUÍA DE REMISIÓN
  // ==========================================================

  @Type(() => Number)
  @IsInt()
  @Min(1)
  remissionGuideId!: number;

  // ==========================================================
  // FECHA RECEPCIÓN
  // ==========================================================

  @IsDateString()
  receptionDate!: string;

  // ==========================================================
  // RESPONSABLE
  // ==========================================================

  @IsString()
  @MaxLength(200)
  responsibleName!: string;

  // ==========================================================
  // INCIDENTE GENERAL
  // ==========================================================

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  incidentDescription?: string;

  // ==========================================================
  // DETALLES
  // ==========================================================

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateRouteSheetDetailDto)
  details!: CreateRouteSheetDetailDto[];
}
