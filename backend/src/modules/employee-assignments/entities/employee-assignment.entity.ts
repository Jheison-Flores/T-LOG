import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Employee } from '../../employees/entities/employee.entity';

import { Position } from '../../positions/entities/position.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { WorkScope } from './work-scope.enum';

@Entity('employee_assignments')
export class EmployeeAssignment {
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
  // CARGO
  // ============================================================

  @ManyToOne(() => Position, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'position_id',
  })
  position!: Position;

  // ============================================================
  // UNIDAD / SEDE / MINA
  //
  // Reutilizamos warehouses porque actualmente ya representa
  // Lima, almacenes y unidades mineras dentro de T-LOG.
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
  // ÁMBITO
  // Oficina, campo (mina) o taller.
  // ============================================================

  @Column({
    type: 'enum',
    enum: WorkScope,
    default: WorkScope.OFFICE,
  })
  workScope!: WorkScope;

  // ============================================================
  // PERIODO DE ASIGNACIÓN
  // ============================================================

  @Column({
    type: 'date',
  })
  startDate!: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  endDate?: string | null;

  // ============================================================
  // ASIGNACIÓN ACTUAL
  // ============================================================

  @Column({
    default: true,
  })
  isCurrent!: boolean;

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
