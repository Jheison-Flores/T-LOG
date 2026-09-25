import { Type } from 'class-transformer';

import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { CreateAttendanceDto } from './create-attendance.dto';

export class BulkUpsertAttendanceDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateAttendanceDto)
  records!: CreateAttendanceDto[];
}
