import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { MineTimesheetCode } from './mine-timesheet-code.enum';

@Entity('mine_timesheets')
@Index('IDX_MINE_TIMESHEET_EMPLOYEE_DATE', ['employee', 'date'], {
  unique: true,
})
export class MineTimesheet {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee!: Employee;

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'warehouse_id',
  })
  warehouse!: Warehouse;

  @Column({
    type: 'date',
  })
  date!: string;

  @Column({
    type: 'enum',
    enum: MineTimesheetCode,
  })
  code!: MineTimesheetCode;

  @Column({
    nullable: true,
    length: 500,
  })
  observations?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
