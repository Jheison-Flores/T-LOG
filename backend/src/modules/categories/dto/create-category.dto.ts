import { IsEnum, IsNotEmpty, IsOptional, Length } from 'class-validator';

import { CategoryColor } from '../entities/category-color.enum';

export class CreateCategoryDto {
  @IsNotEmpty()
  @Length(2, 20)
  code!: string;

  @IsNotEmpty()
  @Length(3, 100)
  name!: string;

  @IsOptional()
  @Length(0, 250)
  description?: string;

  @IsOptional()
  @IsEnum(CategoryColor)
  color?: CategoryColor;

  @IsOptional()
  @Length(0, 50)
  icon?: string;
}
