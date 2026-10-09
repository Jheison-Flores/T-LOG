import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockMovementVouchers20261009000000
  implements MigrationInterface
{
  name = 'AddStockMovementVouchers20261009000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stock_movements"
        ADD COLUMN "voucher_series" character varying(10),
        ADD COLUMN "voucher_prefix" character varying(1),
        ADD COLUMN "voucher_number" integer,
        ADD COLUMN "voucher_date" date,
        ADD COLUMN "voucher_personnel" character varying(200),
        ADD COLUMN "delivered_by" character varying(200),
        ADD COLUMN "received_by" character varying(200),
        ADD COLUMN "voucher_comments" text
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
      CREATE INDEX "IDX_stock_movements_voucher_series_number"
      ON "stock_movements" ("voucher_series", "voucher_prefix", "voucher_number")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "IDX_stock_movements_voucher_series_number"',
    );
    await queryRunner.query(`
      ALTER TABLE "stock_movements"
        DROP COLUMN "voucher_comments",
        DROP COLUMN "received_by",
        DROP COLUMN "delivered_by",
        DROP COLUMN "voucher_personnel",
        DROP COLUMN "voucher_date",
        DROP COLUMN "voucher_number",
        DROP COLUMN "voucher_prefix",
        DROP COLUMN "voucher_series"
    `);
  }
}
