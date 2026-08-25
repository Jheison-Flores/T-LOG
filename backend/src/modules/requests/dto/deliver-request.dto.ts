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

export class DeliverRequestDetailDto {
  @IsInt()
  @Min(1)
  detailId!: number;

  @IsNumber()
  @Min(0)
  quantity!: number;
}

export class DeliverRequestDto {
  @IsInt()
  @Min(1)
  sourceWarehouseId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => DeliverRequestDetailDto)
  details!: DeliverRequestDetailDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;
}
