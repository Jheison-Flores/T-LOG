import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Purchase } from './purchase.entity';

import { Product } from '../../products/entities/product.entity';

@Entity('purchase_details')
export class PurchaseDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // ORDEN DE COMPRA
  // ============================================================

  @ManyToOne(() => Purchase, (purchase) => purchase.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'purchase_id',
  })
  purchase!: Purchase;

  // ============================================================
  // PRODUCTO
  // ============================================================

  @ManyToOne(() => Product, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product!: Product;

  // ============================================================
  // CANTIDAD
  //
  // Mantenemos INTEGER para conservar compatibilidad con
  // los registros existentes y evitar una migración destructiva.
  // ============================================================

  @Column({
    type: 'integer',
  })
  quantity!: number;

  // ============================================================
  // PRECIO UNITARIO
  //
  // Puede estar expresado en PEN o USD según Purchase.currency.
  // ============================================================

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 14,
    scale: 2,
  })
  unitPrice!: number;

  // ============================================================
  // IMPORTE
  //
  // quantity * unitPrice
  // ============================================================

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
  })
  subtotal!: number;

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
