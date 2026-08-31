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
  // COMPRA:F001-000154
  // REQ:REQ-00025
  // TRANSFERENCIA:TR-000123
  // ============================================================

  @Column({
    nullable: true,
    length: 100,
  })
  reference?: string;

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
