import 'dotenv/config';

import { DataSource } from 'typeorm';

import { User } from './src/modules/users/entities/user.entity';

import { Role } from './src/modules/roles/entities/role.entity';

import { Warehouse } from './src/modules/warehouses/entities/warehouse.entity';

import { Category } from './src/modules/categories/entities/category.entity';

import { Product } from './src/modules/products/entities/product.entity';

const databaseUrl = process.env.DATABASE_URL;

export default new DataSource(
  databaseUrl
    ? {
        type: 'postgres',

        url: databaseUrl,

        synchronize: false,

        logging: false,

        ssl: {
          rejectUnauthorized: false,
        },

        entities: [User, Role, Warehouse, Category, Product],

        migrations: ['src/database/migrations/*.ts'],
      }
    : {
        type: 'postgres',

        host: process.env.DB_HOST,

        port: Number(process.env.DB_PORT ?? 5432),

        username: process.env.DB_USERNAME,

        password: process.env.DB_PASSWORD,

        database: process.env.DB_DATABASE,

        synchronize: false,

        logging: false,

        entities: [User, Role, Warehouse, Category, Product],

        migrations: ['src/database/migrations/*.ts'],
      },
);
