import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class ApproveRequestDetailDto {
  @IsInt()
  @Min(1)
  detailId!: number;

  @IsNumber()
  @Min(0)
  approvedQuantity!: number;
}

export class ApproveRequestDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => ApproveRequestDetailDto)
  details!: ApproveRequestDetailDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;
}
