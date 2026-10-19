import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockMovementVoucherFormFields20261019000000
  implements MigrationInterface
{
  name = 'AddStockMovementVoucherFormFields20261019000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stock_movements"
      ADD COLUMN IF NOT EXISTS "area_manager" character varying(200),
      ADD COLUMN IF NOT EXISTS "voucher_shift" character varying(40)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "stock_movements"
      DROP COLUMN IF EXISTS "voucher_shift",
      DROP COLUMN IF EXISTS "area_manager"
    `);
  }
}
