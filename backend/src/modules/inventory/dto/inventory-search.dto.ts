import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class InventorySearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  warehouseId?: number;

  @IsOptional()
  @IsString()
  stockStatus?: 'ALL' | 'NORMAL' | 'LOW' | 'OUT';
}
