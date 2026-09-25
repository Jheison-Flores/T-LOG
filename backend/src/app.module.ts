import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './modules/users/users.module';

import { RolesModule } from './modules/roles/roles.module';

import { AuthModule } from './modules/auth/auth.module';

import { WarehousesModule } from './modules/warehouses/warehouses.module';

import { CategoriesModule } from './modules/categories/categories.module';

import { ProductsModule } from './modules/products/products.module';

import { InventoryModule } from './modules/inventory/inventory.module';

import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';

import { SuppliersModule } from './modules/suppliers/suppliers.module';

import { PurchasesModule } from './modules/purchases/purchases.module';

import { DashboardModule } from './modules/dashboard/dashboard.module';

import { RequestsModule } from './modules/requests/requests.module';

import { SettingsModule } from './modules/settings/setting.module';

import { RemissionGuidesModule } from './modules/remission-guides/remission-guides.module';

import { RouteSheetsModule } from './modules/route-sheets/route-sheets.module';

import { ReportsModule } from './modules/reports/reports.module';

const isProduction = process.env.NODE_ENV === 'production';

const databaseUrl = process.env.DATABASE_URL;

@Module({
  imports: [
    // ==========================================================
    // VARIABLES DE ENTORNO de desarrollo y producción
    // ==========================================================

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ==========================================================
    // POSTGRESQL
    //
    // LOCAL:
    // DB_HOST
    // DB_PORT
    // DB_USERNAME
    // DB_PASSWORD
    // DB_DATABASE
    //
    // RAILWAY:
    // DATABASE_URL
    // ==========================================================

    TypeOrmModule.forRoot(
      databaseUrl
        ? {
            type: 'postgres',

            url: databaseUrl,

            autoLoadEntities: true,

            synchronize: !isProduction,

            ssl: isProduction
              ? {
                  rejectUnauthorized: false,
                }
              : false,
          }
        : {
            type: 'postgres',

            host: process.env.DB_HOST,

            port: Number(process.env.DB_PORT ?? 5432),

            username: process.env.DB_USERNAME,

            password: process.env.DB_PASSWORD,

            database: process.env.DB_DATABASE,

            autoLoadEntities: true,

            synchronize: true,
          },
    ),

    // ==========================================================
    // MÓDULOS
    // ==========================================================

    UsersModule,

    AuthModule,

    RolesModule,

    WarehousesModule,

    CategoriesModule,

    ProductsModule,

    InventoryModule,

    StockMovementsModule,

    SuppliersModule,

    PurchasesModule,

    RequestsModule,

    DashboardModule,

    SettingsModule,

    RemissionGuidesModule,

    RouteSheetsModule,

    ReportsModule,
  ],

  controllers: [],

  providers: [],
})
export class AppModule {}
