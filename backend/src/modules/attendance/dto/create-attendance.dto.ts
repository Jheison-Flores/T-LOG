import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

import { AttendanceStatus } from '../entities/attendance-status.enum';

export class CreateAttendanceDto {
  @IsInt()
  @Min(1)
  employeeId!: number;

  @IsInt()
  @Min(1)
  warehouseId!: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener formato YYYY-MM-DD.',
  })
  date!: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La hora de ingreso debe tener formato HH:mm.',
  })
  checkIn?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'El inicio de refrigerio debe tener formato HH:mm.',
  })
  breakStart?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'El fin de refrigerio debe tener formato HH:mm.',
  })
  breakEnd?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La hora de salida debe tener formato HH:mm.',
  })
  checkOut?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observations?: string;
}
