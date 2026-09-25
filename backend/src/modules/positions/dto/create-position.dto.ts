import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePositionDto {
  // ============================================================
  // NOMBRE
  // ============================================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  // ============================================================
  // ÁREA
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

  // ============================================================
  // DESCRIPCIÓN
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
