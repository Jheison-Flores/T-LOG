import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Company } from '../../companies/entities/company.entity';

import { BankAccountType } from './bank-account-type.enum';

import { EmployeeType } from './employee-type.enum';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // DNI
  // ============================================================

  @Column({
    unique: true,
    length: 8,
  })
  dni!: string;

  // ============================================================
  // DATOS PERSONALES
  // ============================================================

  @Column({
    length: 100,
  })
  firstName!: string;

  @Column({
    length: 100,
  })
  lastName!: string;

  // ============================================================
  // EMPRESA
  // ============================================================

  @ManyToOne(() => Company, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'company_id',
  })
  company!: Company;

  // ============================================================
  // TIPO DE TRABAJADOR
  // ============================================================

  @Column({
    type: 'enum',
    enum: EmployeeType,
  })
  employeeType!: EmployeeType;

  // ============================================================
  // INFORMACIÓN LABORAL
  // ============================================================

  @Column({
    type: 'date',
  })
  hireDate!: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  terminationDate?: string | null;

  // ============================================================
  // CONTACTO
  // ============================================================

  @Column({
    nullable: true,
    length: 20,
  })
  phone?: string;

  @Column({
    nullable: true,
    length: 150,
  })
  email?: string;

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  @Column({
    nullable: true,
    length: 500,
  })
  observations?: string;

  // ============================================================
  // BANCO
  // ============================================================

  @Column({
    nullable: true,
    length: 80,
  })
  bankName?: string;

  @Column({
    type: 'enum',
    enum: BankAccountType,
    nullable: true,
  })
  bankAccountType?: BankAccountType | null;

  @Column({
    nullable: true,
    length: 50,
  })
  bankAccount?: string;

  @Column({
    nullable: true,
    length: 20,
  })
  cci?: string;

  // ============================================================
  // PAGO
  // ============================================================

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  dailyRate!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  overtimeHourRate!: number;

  // ============================================================
  // ESTADO
  // ============================================================

  @Column({
    default: true,
  })
  isActive!: boolean;

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
