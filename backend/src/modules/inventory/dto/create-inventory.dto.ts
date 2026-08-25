import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  productId!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  warehouseId!: number;

  @IsInt()
  @Min(0)
  quantity!: number;
}
