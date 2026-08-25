import { IsInt, IsNumber, Min } from 'class-validator';

import { Type } from 'class-transformer';

export class CreatePurchaseDetailDto {
  // ============================================================
  // PRODUCTO
  // ============================================================

  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId!: number;

  // ============================================================
  // CANTIDAD
  // ============================================================

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  // ============================================================
  // PRECIO UNITARIO
  // ============================================================

  @Type(() => Number)
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  unitPrice!: number;
}
