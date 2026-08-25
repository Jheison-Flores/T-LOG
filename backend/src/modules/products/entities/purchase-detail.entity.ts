import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Purchase } from '../../purchases/entities/purchase.entity';

import { Product } from '../../products/entities/product.entity';

@Entity('purchase_details')
export class PurchaseDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  /*
   * COMPRA
   */

  @ManyToOne(() => Purchase, (purchase) => purchase.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'purchase_id',
  })
  purchase!: Purchase;

  /*
   * PRODUCTO
   */

  @ManyToOne(() => Product, {
    nullable: false,
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product!: Product;

  /*
   * CANTIDAD
   */

  @Column({
    type: 'int',
  })
  quantity!: number;

  /*
   * PRECIO REAL DE ESTA COMPRA
   *
   * Este valor nunca depende posteriormente
   * del currentPrice del producto.
   */
  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  unitPrice!: number;

  /*
   * quantity × unitPrice
   */

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  subtotal!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
