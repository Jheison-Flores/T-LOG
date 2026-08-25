import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RequestDispatch } from './request-dispatch.entity';

import { RequestDetail } from './request-detail.entity';

import { Product } from '../../products/entities/product.entity';

@Entity('request_dispatch_details')
export class RequestDispatchDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // DESPACHO
  // ============================================================

  @ManyToOne(() => RequestDispatch, (dispatch) => dispatch.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'dispatch_id',
  })
  dispatch!: RequestDispatch;

  // ============================================================
  // DETALLE ORIGINAL DE LA SOLICITUD
  // ============================================================

  @ManyToOne(() => RequestDetail, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'request_detail_id',
  })
  requestDetail!: RequestDetail;

  // ============================================================
  // PRODUCTO
  // ============================================================

  @ManyToOne(() => Product, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product!: Product;

  // ============================================================
  // CANTIDAD DESPACHADA
  // ============================================================

  @Column('decimal', {
    precision: 12,
    scale: 2,
  })
  quantity!: number;
}
