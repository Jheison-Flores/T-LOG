import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WarehouseType } from './warehouse-type.enum';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 20,
  })
  code!: string;

  @Column({
    unique: true,
    length: 100,
  })
  name!: string;

  @Column({
    type: 'enum',
    enum: WarehouseType,
  })
  type!: WarehouseType;

  /**
   * Serie de las Guías de Remisión que se generan
   * desde este almacén.
   *
   * Ejemplos:
   * Poderosa = 001
   * Lima     = 002
   * Orex     = 003
   * Kolpa    = 004
   */
  @Column({
    name: 'guide_series',
    type: 'varchar',
    length: 10,
    unique: true,
    nullable: true,
  })
  guideSeries?: string | null;

  @Column({
    nullable: true,
    length: 150,
  })
  city?: string;

  @Column({
    nullable: true,
    length: 200,
  })
  address?: string;

  @Column({
    nullable: true,
    length: 120,
  })
  manager?: string;

  @Column({
    nullable: true,
    length: 20,
  })
  phone?: string;

  @Column({
    nullable: true,
    length: 120,
  })
  email?: string;

  @Column({
    nullable: true,
    length: 300,
  })
  description?: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
