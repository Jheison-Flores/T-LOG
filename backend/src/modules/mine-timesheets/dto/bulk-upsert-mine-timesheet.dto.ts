import { Type } from 'class-transformer';

import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { CreateMineTimesheetDto } from './create-mine-timesheet.dto';

export class BulkUpsertMineTimesheetDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => CreateMineTimesheetDto)
  records!: CreateMineTimesheetDto[];
}
