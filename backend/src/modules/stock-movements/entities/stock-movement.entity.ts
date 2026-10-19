import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { Inventory } from '../../inventory/entities/inventory.entity';

import { User } from '../../users/entities/user.entity';

import { MovementType } from './movement-type.enum';

export type CostCurrency = 'PEN' | 'USD';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // INVENTARIO ORIGEN
  // ============================================================

  @ManyToOne(() => Inventory, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({
    name: 'source_inventory_id',
  })
  sourceInventory?: Inventory;

  // ============================================================
  // INVENTARIO DESTINO
  // ============================================================

  @ManyToOne(() => Inventory, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({
    name: 'destination_inventory_id',
  })
  destinationInventory?: Inventory;

  // ============================================================
  // TIPO DE MOVIMIENTO
  // ============================================================

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  movementType!: MovementType;

  // ============================================================
  // CANTIDAD
  // ============================================================

  @Column({
    type: 'integer',
  })
  quantity!: number;

  // ============================================================
  // VALORIZACIÓN
  // ============================================================

  @Column('decimal', {
    name: 'unit_cost',
    precision: 14,
    scale: 4,
    nullable: true,
  })
  unitCost?: number | null;

  @Column('decimal', {
    name: 'total_cost',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  totalCost?: number | null;

  // ============================================================
  // MONEDA DEL COSTO
  //
  // PEN = Soles
  // USD = Dólares
  //
  // Es nullable para mantener compatibilidad con movimientos
  // históricos que ya tenían precio antes de implementar moneda.
  // ============================================================

  @Column({
    name: 'cost_currency',
    type: 'varchar',
    length: 3,
    nullable: true,
  })
  currency?: CostCurrency | null;

  // ============================================================
  // MOTIVO
  // ============================================================

  @Column({
    nullable: true,
    length: 250,
  })
  reason?: string;

  // ============================================================
  // REFERENCIA
  //
  // Ejemplos:
  //
  // COMPRA:F001-000154
  // REQ:REQ-00025
  // TRANSFERENCIA:TR-000123
  // ============================================================

  @Column({
    nullable: true,
    length: 100,
  })
  reference?: string;

  // Datos del vale de entrada o salida, repetidos en cada línea del lote.
  @Column({ name: 'voucher_series', type: 'varchar', length: 10, nullable: true })
  voucherSeries?: string | null;

  @Column({ name: 'voucher_prefix', type: 'varchar', length: 1, nullable: true })
  voucherPrefix?: 'E' | 'S' | null;

  @Column({ name: 'voucher_number', type: 'integer', nullable: true })
  voucherNumber?: number | null;

  @Column({ name: 'voucher_date', type: 'date', nullable: true })
  voucherDate?: string | null;

  @Column({ name: 'voucher_personnel', type: 'varchar', length: 200, nullable: true })
  voucherPersonnel?: string | null;

  @Column({ name: 'voucher_shift', type: 'varchar', length: 40, nullable: true })
  voucherShift?: string | null;

  @Column({ name: 'delivered_by', type: 'varchar', length: 200, nullable: true })
  deliveredBy?: string | null;

  @Column({ name: 'received_by', type: 'varchar', length: 200, nullable: true })
  receivedBy?: string | null;

  @Column({ name: 'area_manager', type: 'varchar', length: 200, nullable: true })
  areaManager?: string | null;

  @Column({ name: 'voucher_comments', type: 'text', nullable: true })
  voucherComments?: string | null;

  // ============================================================
  // USUARIO
  // ============================================================

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  // ============================================================
  // FECHA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;
}
