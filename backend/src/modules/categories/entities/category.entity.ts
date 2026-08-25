import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CategoryColor } from './category-color.enum';

// Se utilizará cuando creemos Products
// import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 20,
  })
  code!: string;

  @Column({
    unique: true,
    length: 100,
  })
  name!: string;

  @Column({
    nullable: true,
    length: 250,
  })
  description?: string;

  @Column({
    type: 'enum',
    enum: CategoryColor,
    default: CategoryColor.BLUE,
  })
  color!: CategoryColor;

  @Column({
    nullable: true,
    length: 50,
  })
  icon?: string;

  @Column({
    default: true,
  })
  isActive!: boolean;

  /*
  La activaremos cuando exista Products

  @OneToMany(() => Product, product => product.category)
  products!: Product[];
  */

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
