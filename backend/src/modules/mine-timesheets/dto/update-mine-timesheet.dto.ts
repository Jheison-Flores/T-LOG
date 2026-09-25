import { PartialType } from '@nestjs/mapped-types';

import { CreateMineTimesheetDto } from './create-mine-timesheet.dto';

export class UpdateMineTimesheetDto extends PartialType(
  CreateMineTimesheetDto,
) {}
