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

import { AttendanceStatus } from './attendance-status.enum';

@Entity('attendance_records')
@Index('IDX_ATTENDANCE_EMPLOYEE_DATE', ['employee', 'date'], {
  unique: true,
})
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // TRABAJADOR
  // ============================================================

  @ManyToOne(() => Employee, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'employee_id',
  })
  employee!: Employee;

  // ============================================================
  // SEDE
  // ============================================================

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'warehouse_id',
  })
  warehouse!: Warehouse;

  // ============================================================
  // FECHA
  // ============================================================

  @Column({
    type: 'date',
  })
  date!: string;

  // ============================================================
  // ESTADO
  // ============================================================

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status!: AttendanceStatus;

  // ============================================================
  // HORARIOS
  // ============================================================

  @Column({
    type: 'time',
    nullable: true,
  })
  checkIn?: string | null;

  @Column({
    type: 'time',
    nullable: true,
  })
  breakStart?: string | null;

  @Column({
    type: 'time',
    nullable: true,
  })
  breakEnd?: string | null;

  @Column({
    type: 'time',
    nullable: true,
  })
  checkOut?: string | null;

  // ============================================================
  // HORAS
  // ============================================================

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    default: 0,
  })
  normalHours!: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    default: 0,
  })
  overtimeHours!: number;

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  @Column({
    nullable: true,
    length: 500,
  })
  observations?: string;

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
