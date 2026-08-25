import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';

import { Unit } from './unit.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    nullable: true,
    length: 20,
  })
  sku?: string;

  @Column({
    unique: true,
    nullable: true,
    length: 20,
  })
  internalCode?: string;

  @Column({
    length: 150,
  })
  name!: string;

  @Column({
    nullable: true,
    length: 500,
  })
  description?: string;

  @Column({
    nullable: true,
    length: 100,
  })
  brand?: string;

  @Column({
    nullable: true,
    length: 100,
  })
  model?: string;

  @Column({
    type: 'enum',
    enum: Unit,
  })
  unit!: Unit;

  @Column({
    default: 0,
  })
  minimumStock!: number;

  @Column({
    name: 'current_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  currentPrice?: number | null;

  @Column({
    default: false,
  })
  requiresSerial!: boolean;

  @Column({
    default: false,
  })
  requiresBatch!: boolean;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @ManyToOne(() => Category)
  @JoinColumn({
    name: 'category_id',
  })
  category!: Category;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
