import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { WorkScope } from '../entities/work-scope.enum';

export class CreateEmployeeAssignmentDto {
  // ============================================================
  // TRABAJADOR
  // ============================================================

  @IsInt()
  @Min(1)
  employeeId!: number;

  // ============================================================
  // CARGO
  // ============================================================

  @IsInt()
  @Min(1)
  positionId!: number;

  // ============================================================
  // UNIDAD / SEDE
  // ============================================================

  @IsInt()
  @Min(1)
  warehouseId!: number;

  // ============================================================
  // ÁMBITO
  // ============================================================

  @IsOptional()
  @IsEnum(WorkScope)
  workScope?: WorkScope;

  // ============================================================
  // FECHA DE INICIO
  // ============================================================

  @IsString()
  @IsNotEmpty()
  startDate!: string;

  // ============================================================
  // FECHA DE FIN
  // ============================================================

  @IsOptional()
  @IsString()
  endDate?: string;

  // ============================================================
  // ASIGNACIÓN ACTUAL
  // ============================================================

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observations?: string;
}
