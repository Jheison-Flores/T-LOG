import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

import { CreateRequestDetailDto } from './create-request-details.dto';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  requester!: string;

  /*
   * ADMIN puede indicar la mina.
   *
   * Para usuarios normales,
   * RequestsService utiliza user.warehouse.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  warehouseId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observations?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateRequestDetailDto)
  details!: CreateRequestDetailDto[];
}
