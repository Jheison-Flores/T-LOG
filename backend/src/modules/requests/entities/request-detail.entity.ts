import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';

import { Request } from './request.entity';

@Entity('request_details')
export class RequestDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // REQUERIMIENTO
  // ============================================================

  @ManyToOne(() => Request, (request) => request.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'request_id',
  })
  request!: Request;

  // ============================================================
  // PRODUCTO
  // ============================================================

  @ManyToOne(() => Product, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product!: Product;

  // ============================================================
  // CANTIDAD SOLICITADA
  // ============================================================

  @Column('decimal', {
    precision: 12,
    scale: 2,
  })
  quantity!: number;

  // ============================================================
  // CANTIDAD APROBADA
  // ============================================================

  @Column('decimal', {
    name: 'approved_quantity',
    precision: 12,
    scale: 2,
    default: 0,
  })
  approvedQuantity!: number;

  // ============================================================
  // CANTIDAD DESPACHADA
  // ============================================================

  @Column('decimal', {
    name: 'delivered_quantity',
    precision: 12,
    scale: 2,
    default: 0,
  })
  deliveredQuantity!: number;

  // ============================================================
  // OBSERVACIÓN
  // ============================================================

  @Column({
    type: 'text',
    nullable: true,
  })
  observations?: string | null;
}
