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

import { MineTimesheetCode } from '../entities/mine-timesheet-code.enum';

export class CreateMineTimesheetDto {
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

  @IsEnum(MineTimesheetCode)
  code!: MineTimesheetCode;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observations?: string;
}
