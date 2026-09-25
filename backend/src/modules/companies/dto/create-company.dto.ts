import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCompanyDto {
  // ============================================================
  // RAZÓN SOCIAL
  // ============================================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  legalName!: string;

  // ============================================================
  // NOMBRE COMERCIAL
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tradeName?: string;

  // ============================================================
  // RUC
  // ============================================================

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  @Matches(/^\d{11}$/, {
    message: 'El RUC debe contener exactamente 11 dígitos.',
  })
  ruc!: string;

  // ============================================================
  // DIRECCIÓN
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;
}
