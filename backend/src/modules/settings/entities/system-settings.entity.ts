import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // EMPRESA
  // ============================================================

  @Column({
    length: 150,
    default: 'Teincomin',
  })
  companyName!: string;

  @Column({
    nullable: true,
    length: 20,
  })
  ruc?: string;

  @Column({
    nullable: true,
    length: 250,
  })
  companyAddress?: string;

  @Column({
    nullable: true,
    length: 30,
  })
  companyPhone?: string;

  @Column({
    nullable: true,
    length: 150,
  })
  companyEmail?: string;

  // ============================================================
  // LOGÍSTICA
  // ============================================================

  @ManyToOne(() => Warehouse, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'central_warehouse_id',
  })
  centralWarehouse?: Warehouse | null;

  @Column({
    length: 10,
    default: 'REQ',
  })
  requestPrefix!: string;

  @Column({
    length: 10,
    default: 'DSP',
  })
  dispatchPrefix!: string;

  @Column({
    length: 10,
    default: 'COM',
  })
  purchasePrefix!: string;

  // ============================================================
  // SISTEMA
  // ============================================================

  @Column({
    length: 100,
    default: 'T-LOG',
  })
  systemName!: string;

  @Column({
    length: 10,
    default: 'PEN',
  })
  currency!: string;

  @Column({
    length: 80,
    default: 'America/Lima',
  })
  timezone!: string;

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
