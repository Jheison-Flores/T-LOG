import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @Length(8, 100, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres.',
  })
  newPassword?: string;

  @IsOptional()
  @IsString()
  confirmPassword?: string;
}
