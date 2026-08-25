import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Request } from './request.entity';

import { RequestDispatchDetail } from './request-dispatch.detail.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { User } from '../../users/entities/user.entity';

@Entity('request_dispatches')
export class RequestDispatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'dispatch_number',
    unique: true,
    length: 30,
  })
  dispatchNumber!: string;

  // ============================================================
  // SOLICITUD
  // ============================================================

  @ManyToOne(() => Request, (request) => request.dispatches, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'request_id',
  })
  request!: Request;

  // ============================================================
  // ALMACÉN ORIGEN
  // ============================================================

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'source_warehouse_id',
  })
  sourceWarehouse!: Warehouse;

  // ============================================================
  // ALMACÉN DESTINO
  // ============================================================

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'destination_warehouse_id',
  })
  destinationWarehouse!: Warehouse;

  // ============================================================
  // USUARIO QUE REALIZA EL DESPACHO
  // ============================================================

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'created_by',
  })
  createdBy!: User;

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  @Column({
    type: 'text',
    nullable: true,
  })
  observations?: string | null;

  // ============================================================
  // DETALLES DEL DESPACHO
  // ============================================================

  @OneToMany(() => RequestDispatchDetail, (detail) => detail.dispatch, {
    cascade: true,
    eager: true,
  })
  details!: RequestDispatchDetail[];

  // ============================================================
  // FECHA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;
}
