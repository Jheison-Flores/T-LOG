import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // NOMBRE DEL CARGO
  // ============================================================

  @Column({
    unique: true,
    length: 120,
  })
  name!: string;

  // ============================================================
  // ÁREA
  // ============================================================

  @Column({
    nullable: true,
    length: 100,
  })
  area?: string;

  // ============================================================
  // DESCRIPCIÓN
  // ============================================================

  @Column({
    nullable: true,
    length: 300,
  })
  description?: string;

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
