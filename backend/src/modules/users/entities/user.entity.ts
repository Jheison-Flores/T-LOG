import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Role } from '../../roles/entities/role.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 30,
  })
  username!: string;

  @Column({
    length: 100,
  })
  firstName!: string;

  @Column({
    length: 100,
  })
  lastName!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column({
    nullable: true,
    length: 20,
  })
  phone?: string;

  @Column({
    nullable: true,
    length: 100,
  })
  position?: string;

  // Nunca se expone automáticamente en respuestas/consultas normales.
  @Column({
    select: false,
  })
  password!: string;

  @ManyToOne(() => Role, (role) => role.users, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({
    name: 'role_id',
  })
  role!: Role;

  @ManyToOne(() => Warehouse, {
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'warehouse_id',
  })
  warehouse?: Warehouse | null;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @Column({
    default: false,
  })
  mustChangePassword!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  lastLogin?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
