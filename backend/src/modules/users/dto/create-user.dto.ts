import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Length,
  IsInt,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(4, 30)
  username!: string;

  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  position?: string;

  @IsNotEmpty()
  @Length(8, 100)
  password!: string;

  @IsInt()
  @Min(1)
  roleId!: number;

  // ============================================================
  // MINA / ALMACÉN
  // ============================================================

  @IsOptional()
  @IsInt()
  @Min(1)
  warehouseId?: number;
}
