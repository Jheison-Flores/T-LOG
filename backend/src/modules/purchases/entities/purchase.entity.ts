import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Supplier } from '../../suppliers/entities/supplier.entity';

import { PurchaseDetail } from './purchase-detail.entity';

import { PurchaseStatus } from './purchase-status.enum';

import { PurchaseCurrency } from './purchase-currency.enum';

import { Warehouse } from '../../warehouses/entities/warehouse.entity';

import { User } from '../../users/entities/user.entity';

import { Request } from '../../requests/entities/request.entity';

@Entity('purchases')
export class Purchase {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // NÚMERO O.C.
  //
  // Conservamos físicamente invoiceNumber para no romper BD.
  // ============================================================

  @Column({
    name: 'invoiceNumber',

    type: 'varchar',

    length: 50,

    unique: true,
  })
  purchaseOrderNumber!: string;

  // ============================================================
  // UNIDAD / MINA
  // ============================================================

  @ManyToOne(() => Warehouse, {
    eager: true,

    nullable: true,

    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'warehouse_id',
  })
  warehouse?: Warehouse | null;

  // ============================================================
  // REQUERIMIENTO
  // ============================================================

  @ManyToOne(() => Request, {
    nullable: true,

    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'request_id',
  })
  request?: Request | null;

  // ============================================================
  // PROVEEDOR
  // ============================================================

  @ManyToOne(() => Supplier, {
    eager: true,

    nullable: false,

    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'supplier_id',
  })
  supplier!: Supplier;

  // ============================================================
  // FECHA
  // ============================================================

  @Column({
    name: 'purchaseDate',

    type: 'date',

    nullable: true,
  })
  purchaseDate?: string | null;

  // ============================================================
  // COTIZACIÓN
  // ============================================================

  @Column({
    name: 'quotation_number',

    type: 'varchar',

    length: 100,

    nullable: true,
  })
  quotationNumber?: string | null;

  // ============================================================
  // MONEDA
  // ============================================================

  @Column({
    type: 'enum',

    enum: PurchaseCurrency,

    default: PurchaseCurrency.PEN,
  })
  currency!: PurchaseCurrency;

  // ============================================================
  // IGV
  // ============================================================

  @Column({
    name: 'apply_igv',

    type: 'boolean',

    default: true,
  })
  applyIgv!: boolean;

  // ============================================================
  // MONTOS
  // ============================================================

  @Column({
    name: 'subtotal_amount',

    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,
  })
  subtotalAmount!: number;

  @Column({
    name: 'igv_amount',

    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,
  })
  igvAmount!: number;

  @Column({
    name: 'totalAmount',

    type: 'decimal',

    precision: 12,

    scale: 2,

    default: 0,
  })
  totalAmount!: number;

  // ============================================================
  // CONDICIONES
  // ============================================================

  @Column({
    name: 'commercial_conditions',

    type: 'text',

    nullable: true,
  })
  commercialConditions?: string | null;

  @Column({
    name: 'payment_method',

    type: 'varchar',

    length: 150,

    nullable: true,
  })
  paymentMethod?: string | null;

  // ============================================================
  // OBSERVACIÓN
  // ============================================================

  @Column({
    type: 'text',

    nullable: true,
  })
  observation?: string | null;

  // ============================================================
  // ESTADO
  // ============================================================

  @Column({
    type: 'enum',

    enum: PurchaseStatus,

    default: PurchaseStatus.REGISTERED,
  })
  status!: PurchaseStatus;

  // ============================================================
  // DETALLES
  // ============================================================

  @OneToMany(() => PurchaseDetail, (detail) => detail.purchase, {
    cascade: true,

    eager: true,
  })
  details!: PurchaseDetail[];

  // ============================================================
  // CREADO POR
  // ============================================================

  @ManyToOne(() => User, {
    eager: true,

    nullable: true,

    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'created_by',
  })
  createdBy?: User | null;

  // ============================================================
  // RECEPCIÓN
  // ============================================================

  @ManyToOne(() => Warehouse, {
    eager: true,

    nullable: true,

    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'received_warehouse_id',
  })
  receivedWarehouse?: Warehouse | null;

  @ManyToOne(() => User, {
    eager: true,

    nullable: true,

    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'received_by',
  })
  receivedBy?: User | null;

  @Column({
    name: 'received_at',

    type: 'timestamp',

    nullable: true,
  })
  receivedAt?: Date | null;

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
