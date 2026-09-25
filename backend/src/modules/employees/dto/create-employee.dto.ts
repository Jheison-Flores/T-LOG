import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';

import { Type } from 'class-transformer';

import { BankAccountType } from '../entities/bank-account-type.enum';

import { EmployeeType } from '../entities/employee-type.enum';

export class CreateEmployeeDto {
  // ============================================================
  // DNI
  // ============================================================

  @IsString()
  @Length(8, 8)
  @Matches(/^\d{8}$/, {
    message: 'El DNI debe contener exactamente 8 dígitos.',
  })
  dni!: string;

  // ============================================================
  // NOMBRES
  // ============================================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  // ============================================================
  // APELLIDOS
  // ============================================================

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  // ============================================================
  // EMPRESA
  // ============================================================

  @IsInt()
  @Min(1)
  companyId!: number;

  // ============================================================
  // TIPO DE TRABAJADOR
  // ============================================================

  @IsEnum(EmployeeType)
  employeeType!: EmployeeType;

  // ============================================================
  // FECHA DE INGRESO
  // ============================================================

  @IsString()
  @IsNotEmpty()
  hireDate!: string;

  // ============================================================
  // FECHA DE CESE
  // ============================================================

  @IsOptional()
  @IsString()
  terminationDate?: string;

  // ============================================================
  // TELÉFONO
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  // ============================================================
  // CORREO
  // ============================================================

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observations?: string;

  // ============================================================
  // BANCO
  // ============================================================

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bankName?: string;

  @IsOptional()
  @IsEnum(BankAccountType)
  bankAccountType?: BankAccountType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccount?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cci?: string;

  // ============================================================
  // PAGO
  // ============================================================

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  overtimeHourRate?: number;
}
