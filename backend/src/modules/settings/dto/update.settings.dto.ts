import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateSettingsDto {
  // ============================================================
  // EMPRESA
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(150)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ruc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  companyAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  companyPhone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  companyEmail?: string;

  // ============================================================
  // LOGÍSTICA
  // ============================================================

  @IsOptional()
  @IsInt()
  @Min(1)
  centralWarehouseId?: number | null;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  requestPrefix?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  dispatchPrefix?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  purchasePrefix?: string;

  // ============================================================
  // SISTEMA
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(100)
  systemName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;
}
