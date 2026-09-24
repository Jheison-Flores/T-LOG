import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { WarehouseType } from '../entities/warehouse-type.enum';

export class CreateWarehouseDto {
  @IsNotEmpty()
  @Length(2, 20)
  code!: string;

  @IsNotEmpty()
  @Length(3, 100)
  name!: string;

  @IsEnum(WarehouseType)
  type!: WarehouseType;

  @IsOptional()
  @IsString()
  @Matches(/^\d{3}$/, {
    message: 'La serie de guía debe contener exactamente 3 dígitos.',
  })
  remissionGuideSeries?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  manager?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  description?: string;
}
