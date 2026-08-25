import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // RAZÓN SOCIAL / NOMBRE
  // ============================================================

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  // ============================================================
  // RUC
  // ============================================================

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ruc?: string | null;

  // ============================================================
  // DIRECCIÓN
  // ============================================================

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address?: string | null;

  // ============================================================
  // TELÉFONO
  // ============================================================

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phone?: string | null;

  // ============================================================
  // CORREO
  // ============================================================

  @Column({
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  email?: string | null;

  // ============================================================
  // ESTADO
  // ============================================================

  @Column({
    type: 'boolean',
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
