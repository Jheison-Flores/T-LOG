import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 30,
  })
  code!: string;

  @Column({
    unique: true,
    length: 80,
  })
  name!: string;

  @Column({
    nullable: true,
    length: 200,
  })
  description?: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @OneToMany(() => User, (user: User) => user.role)
  users!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
