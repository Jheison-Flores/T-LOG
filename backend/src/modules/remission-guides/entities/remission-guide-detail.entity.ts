import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RemissionGuide } from './remission-guide.entity';

import { RequestDetail } from '../../requests/entities/request-detail.entity';

import { Product } from '../../products/entities/product.entity';

export type RemissionGuideCostCurrency = 'PEN' | 'USD';

@Entity('remission_guide_details')
export class RemissionGuideDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => RemissionGuide, (guide) => guide.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'remission_guide_id',
  })
  guide!: RemissionGuide;

  @ManyToOne(() => RequestDetail, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'request_detail_id',
  })
  requestDetail?: RequestDetail | null;

  @ManyToOne(() => Product, {
    eager: true,
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
  })
  product?: Product | null;

  // ============================================================
  // SNAPSHOT DESCRIPTIVO
  //
  // Conserva lo mostrado en la Guía incluso si luego se modifica
  // el maestro de productos.
  // ============================================================

  @Column({
    name: 'description',
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'unit',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  unit?: string | null;

  // ============================================================
  // CANTIDAD
  // ============================================================

  @Column('decimal', {
    precision: 12,
    scale: 2,
  })
  quantity!: number;

  // ============================================================
  // SNAPSHOT DE VALORIZACIÓN
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
  // MONEDA HISTÓRICA DEL DESPACHO
  //
  // PEN = Soles
  // USD = Dólares
  //
  // Se guarda como snapshot para que un cambio posterior en una
  // O.C. o en el inventario no altere el reporte histórico.
  //
  // Nullable para mantener compatibilidad con guías antiguas.
  // ============================================================

  @Column({
    name: 'cost_currency',
    type: 'varchar',
    length: 3,
    nullable: true,
  })
  currency?: RemissionGuideCostCurrency | null;

  // ============================================================
  // PESO
  // ============================================================

  @Column('decimal', {
    name: 'total_weight',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  totalWeight?: number | null;
}
