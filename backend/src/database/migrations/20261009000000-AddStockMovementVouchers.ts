import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockMovementVouchers20261009000000
  implements MigrationInterface
{
  name = 'AddStockMovementVouchers20261009000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stock_movements"
        ADD COLUMN IF NOT EXISTS "voucher_series" character varying(10),
        ADD COLUMN IF NOT EXISTS "voucher_prefix" character varying(1),
        ADD COLUMN IF NOT EXISTS "voucher_number" integer,
        ADD COLUMN IF NOT EXISTS "voucher_date" date,
        ADD COLUMN IF NOT EXISTS "voucher_personnel" character varying(200),
        ADD COLUMN IF NOT EXISTS "delivered_by" character varying(200),
        ADD COLUMN IF NOT EXISTS "received_by" character varying(200),
        ADD COLUMN IF NOT EXISTS "voucher_comments" text
    `);

    await queryRunner.query(`
      UPDATE "stock_movements"
      SET "voucher_prefix" = CASE
        WHEN "movementType" = 'ENTRY' THEN 'E'
        WHEN "movementType" = 'OUTPUT' THEN 'S'
        ELSE NULL
      END
      WHERE "voucher_series" IS NOT NULL AND "voucher_number" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_stock_movements_voucher_series_number"
      ON "stock_movements" ("voucher_series", "voucher_prefix", "voucher_number")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_stock_movements_voucher_series_number"',
    );
    await queryRunner.query(`
      ALTER TABLE "stock_movements"
        DROP COLUMN IF EXISTS "voucher_comments",
        DROP COLUMN IF EXISTS "received_by",
        DROP COLUMN IF EXISTS "delivered_by",
        DROP COLUMN IF EXISTS "voucher_personnel",
        DROP COLUMN IF EXISTS "voucher_date",
        DROP COLUMN IF EXISTS "voucher_number",
        DROP COLUMN IF EXISTS "voucher_prefix",
        DROP COLUMN IF EXISTS "voucher_series"
    `);
  }
}
