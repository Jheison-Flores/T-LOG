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

import { RemissionGuide } from '../../remission-guides/entities/remission-guide.entity';
import { Request } from '../../requests/entities/request.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { RouteSheetDetail } from './route-sheet-detail.entity';
import { RouteSheetStatus } from './route-sheet-status.enum';

@Entity('route_sheets')
export class RouteSheet {
  @PrimaryGeneratedColumn()
  id!: number;

  // ============================================================
  // NÚMERO
  //
  // Ej:
  // HR-2026-000001
  // ============================================================

  @Column({
    name: 'route_sheet_number',
    type: 'varchar',
    length: 30,
    unique: true,
  })
  routeSheetNumber!: string;

  // ============================================================
  // GUÍA
  //
  // Una guía solamente puede tener una hoja de recepción.
  // ============================================================

  @ManyToOne(() => RemissionGuide, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'remission_guide_id',
  })
  remissionGuide!: RemissionGuide;

  // ============================================================
  // REQUERIMIENTO
  //
  // REQUEST:
  //   contiene requerimiento.
  //
  // MANUAL_WAREHOUSE:
  //   no tiene requerimiento, pero sí tiene recepción en mina.
  //
  // EXTERNAL_SERVICE:
  //   no genera Hoja de Recorrido.
  // ============================================================

  @ManyToOne(() => Request, {
    eager: true,
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'request_id',
  })
  request?: Request | null;

  // ============================================================
  // UNIDAD / MINA
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
  // FECHA ENVÍO
  //
  // Sale automáticamente de la Guía.
  // ============================================================

  @Column({
    name: 'shipping_date',
    type: 'date',
  })
  shippingDate!: string;

  // ============================================================
  // FECHA RECEPCIÓN
  // ============================================================

  @Column({
    name: 'reception_date',
    type: 'date',
  })
  receptionDate!: string;

  // ============================================================
  // RESPONSABLE
  // ============================================================

  @Column({
    name: 'responsible_name',
    type: 'varchar',
    length: 200,
  })
  responsibleName!: string;

  // ============================================================
  // INCIDENTE GENERAL
  // ============================================================

  @Column({
    name: 'incident_description',
    type: 'text',
    nullable: true,
  })
  incidentDescription?: string | null;

  // ============================================================
  // ESTADO
  // ============================================================

  @Column({
    type: 'enum',
    enum: RouteSheetStatus,
  })
  status!: RouteSheetStatus;

  // ============================================================
  // USUARIO QUE REGISTRA
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
  // DETALLES
  // ============================================================

  @OneToMany(() => RouteSheetDetail, (detail) => detail.routeSheet, {
    cascade: true,
    eager: true,
  })
  details!: RouteSheetDetail[];

  // ============================================================
  // AUDITORÍA
  // ============================================================

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
