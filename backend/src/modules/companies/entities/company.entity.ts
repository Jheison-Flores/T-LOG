import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // RAZÓN SOCIAL
  // ============================================================

  @Column({
    unique: true,
    length: 200,
  })
  legalName!: string;

  // ============================================================
  // NOMBRE COMERCIAL
  // ============================================================

  @Column({
    nullable: true,
    length: 150,
  })
  tradeName?: string;

  // ============================================================
  // RUC
  // ============================================================

  @Column({
    unique: true,
    length: 11,
  })
  ruc!: string;

  // ============================================================
  // DIRECCIÓN
  // ============================================================

  @Column({
    nullable: true,
    length: 250,
  })
  address?: string;

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
