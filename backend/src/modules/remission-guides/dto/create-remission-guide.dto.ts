import {
  ArrayMinSize,
  IsArray,
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

import { TransferReason } from '../entities/transfer-reason.enum';
import { RemissionGuideType } from '../entities/remission-guide-type.enum';

export class CreateRemissionGuideDetailDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestDetailId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  quantity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalWeight?: number;
}

export class CreateRemissionGuideDto {
  @IsEnum(RemissionGuideType)
  guideType!: RemissionGuideType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationWarehouseId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  arrivalPoint?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  recipientRuc?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsDateString()
  transferStartDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  vehicleBrand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationCertificate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  driverLicense?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  transportCompanyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  transportCompanyRuc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  purchaseOrderReference?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumCost?: number;

  @IsOptional()
  @IsEnum(TransferReason)
  transferReason?: TransferReason;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  otherTransferReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;

  @IsArray()
  @ArrayMinSize(1, {
    message: 'La guía debe contener al menos un producto.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateRemissionGuideDetailDto)
  details!: CreateRemissionGuideDetailDto[];
}
