import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RouteSheet } from './route-sheet.entity';
import { RemissionGuideDetail } from '../../remission-guides/entities/remission-guide-detail.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('route_sheet_details')
export class RouteSheetDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // HOJA DE RECORRIDO
  // ============================================================

  @ManyToOne(() => RouteSheet, (routeSheet) => routeSheet.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'route_sheet_id',
  })
  routeSheet!: RouteSheet;

  // ============================================================
  // DETALLE DE GUÍA ORIGINAL
  // ============================================================

  @ManyToOne(() => RemissionGuideDetail, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'remission_guide_detail_id',
  })
  remissionGuideDetail!: RemissionGuideDetail;

  // ============================================================
  // PRODUCTO
  //
  // Sigue siendo obligatorio en Hoja de Recorrido porque:
  // - REQUEST usa productos registrados.
  // - MANUAL_WAREHOUSE usa productos registrados.
  // - EXTERNAL_SERVICE no genera Hoja de Recorrido.
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
  // CANTIDAD QUE SALIÓ DE LIMA
  // ============================================================

  @Column('decimal', {
    name: 'sent_quantity',
    precision: 12,
    scale: 2,
  })
  sentQuantity!: number;

  // ============================================================
  // CANTIDAD RECIBIDA EN MINA
  // ============================================================

  @Column('decimal', {
    name: 'received_quantity',
    precision: 12,
    scale: 2,
  })
  receivedQuantity!: number;

  // ============================================================
  // CONFORMIDAD
  // ============================================================

  @Column({
    name: 'is_conforming',
    type: 'boolean',
    default: true,
  })
  isConforming!: boolean;

  // ============================================================
  // INSTALACIÓN / ENTREGA FINAL
  // ============================================================

  @Column({
    name: 'installation_conforming',
    type: 'boolean',
    nullable: true,
  })
  installationConforming?: boolean | null;

  // ============================================================
  // OBSERVACIÓN PARTICULAR
  // ============================================================

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observation?: string | null;
}
