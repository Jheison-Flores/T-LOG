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

import { Request } from '../../requests/entities/request.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { RemissionGuideDetail } from './remission-guide-detail.entity';
import { RemissionGuideStatus } from './remission-guide-status.enum';
import { TransferReason } from './transfer-reason.enum';
import { RemissionGuideType } from './remission-guide-type.enum';

@Entity('remission_guides')
export class RemissionGuide {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: RemissionGuideType,
    default: RemissionGuideType.REQUEST,
    name: 'guide_type',
  })
  guideType!: RemissionGuideType;

  @Column({ type: 'varchar', length: 10, default: '002' })
  series!: string;

  @Column({ name: 'guide_number', type: 'varchar', length: 20 })
  guideNumber!: string;

  @Column({ name: 'full_number', type: 'varchar', length: 40, unique: true })
  fullNumber!: string;

  @ManyToOne(() => Request, {
    eager: true,
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'request_id' })
  request?: Request | null;

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'source_warehouse_id' })
  sourceWarehouse!: Warehouse;

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'destination_warehouse_id' })
  destinationWarehouse?: Warehouse | null;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ name: 'transfer_start_date', type: 'date' })
  transferStartDate!: string;

  @Column({ name: 'departure_point', type: 'varchar', length: 300 })
  departurePoint!: string;

  @Column({ name: 'arrival_point', type: 'varchar', length: 300 })
  arrivalPoint!: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 200 })
  recipientName!: string;

  @Column({
    name: 'recipient_ruc',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  recipientRuc?: string | null;

  @Column({
    name: 'purchase_order_reference',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  purchaseOrderReference?: string | null;

  @Column({
    name: 'minimum_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  minimumCost?: number | null;

  @Column({
    name: 'vehicle_brand',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  vehicleBrand?: string | null;

  @Column({
    name: 'vehicle_plate',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  vehiclePlate?: string | null;

  @Column({
    name: 'registration_certificate',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  registrationCertificate?: string | null;

  @Column({
    name: 'driver_license',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  driverLicense?: string | null;

  @Column({
    name: 'transport_company_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  transportCompanyName?: string | null;

  @Column({
    name: 'transport_company_ruc',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  transportCompanyRuc?: string | null;

  @Column({
    name: 'transfer_reason',
    type: 'enum',
    enum: TransferReason,
    default: TransferReason.BETWEEN_ESTABLISHMENTS,
  })
  transferReason!: TransferReason;

  @Column({
    name: 'other_transfer_reason',
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  otherTransferReason?: string | null;

  @Column({ type: 'text', nullable: true })
  observations?: string | null;

  @Column({
    type: 'enum',
    enum: RemissionGuideStatus,
    default: RemissionGuideStatus.ISSUED,
  })
  status!: RemissionGuideStatus;

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @OneToMany(() => RemissionGuideDetail, (detail) => detail.guide, {
    cascade: true,
    eager: true,
  })
  details!: RemissionGuideDetail[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
