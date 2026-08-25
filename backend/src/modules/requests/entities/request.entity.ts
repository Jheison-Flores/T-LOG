import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { RequestDetail } from './request-detail.entity';

import { RequestDispatch } from './request-dispatch.entity';

import { RequestStatus } from './request-status.enum';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // NÚMERO DEL REQUERIMIENTO
  // ============================================================

  @Column({
    type: 'varchar',
    unique: true,
    length: 30,
  })
  requestNumber!: string;

  // ============================================================
  // SOLICITANTE
  // ============================================================

  @Column({
    type: 'varchar',
    length: 150,
  })
  requester!: string;

  // ============================================================
  // DESTINO
  //
  // Ejemplo:
  // Lima
  // Poderosa
  // Kolpa
  // Orex
  // ============================================================

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  destination?: string | null;

  // ============================================================
  // ATENCIÓN
  //
  // Ejemplo:
  // Logística Lima
  // Almacén Central
  // Taller
  // ============================================================

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  attention?: string | null;

  // ============================================================
  // OBSERVACIONES GENERALES
  // ============================================================

  @Column({
    type: 'text',
    nullable: true,
  })
  observations?: string | null;

  // ============================================================
  // ESTADO DEL REQUERIMIENTO
  // ============================================================

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status!: RequestStatus;

  // ============================================================
  // MINA / ALMACÉN SOLICITANTE
  // ============================================================

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'warehouse_id',
  })
  warehouse!: Warehouse;

  // ============================================================
  // ELABORADO POR
  //
  // Usuario que creó el requerimiento.
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
  // REVISADO POR
  // ============================================================

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'reviewed_by',
  })
  reviewedBy?: User | null;

  @Column({
    name: 'reviewed_at',
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt?: Date | null;

  // ============================================================
  // APROBADO POR
  // ============================================================

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'approved_by',
  })
  approvedBy?: User | null;

  @Column({
    name: 'approved_at',
    type: 'timestamp',
    nullable: true,
  })
  approvedAt?: Date | null;

  // ============================================================
  // MOTIVO DE RECHAZO
  // ============================================================

  @Column({
    name: 'rejection_reason',
    type: 'text',
    nullable: true,
  })
  rejectionReason?: string | null;

  // ============================================================
  // DETALLES DEL REQUERIMIENTO
  // ============================================================

  @OneToMany(() => RequestDetail, (detail) => detail.request, {
    cascade: true,
    eager: true,
  })
  details!: RequestDetail[];

  // ============================================================
  // DESPACHOS
  // ============================================================

  @OneToMany(() => RequestDispatch, (dispatch) => dispatch.request, {
    cascade: false,
  })
  dispatches!: RequestDispatch[];

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
