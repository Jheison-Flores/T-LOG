import { IsInt, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class ReceivePurchaseDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  warehouseId!: number;
}
