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

@Entity('remission_guide_details')
export class RemissionGuideDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => RemissionGuide, (guide) => guide.details, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'remission_guide_id' })
  guide!: RemissionGuide;

  @ManyToOne(() => RequestDetail, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'request_detail_id' })
  requestDetail?: RequestDetail | null;

  @ManyToOne(() => Product, {
    eager: true,
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product?: Product | null;

  // Snapshot descriptivo para guías manuales y para conservar
  // el texto mostrado aunque el maestro de productos cambie.
  @Column({ name: 'description', type: 'varchar', length: 300, nullable: true })
  description?: string | null;

  @Column({ name: 'unit', type: 'varchar', length: 50, nullable: true })
  unit?: string | null;

  @Column('decimal', { precision: 12, scale: 2 })
  quantity!: number;

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

  @Column('decimal', {
    name: 'total_weight',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  totalWeight?: number | null;
}
