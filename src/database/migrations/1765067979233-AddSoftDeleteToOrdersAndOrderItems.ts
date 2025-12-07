import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToOrdersAndOrderItems1765067979233 implements MigrationInterface {
    name = 'AddSoftDeleteToOrdersAndOrderItems1765067979233'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "microbatches" DROP COLUMN "bags_obtained_250g"`);
        await queryRunner.query(`ALTER TABLE "microbatches" DROP COLUMN "samples_obtained_100g"`);
        await queryRunner.query(`ALTER TABLE "microbatches" DROP COLUMN "leftover_grams"`);
        await queryRunner.query(`ALTER TABLE "microbatches" DROP COLUMN "extra_bag"`);
        await queryRunner.query(`ALTER TABLE "product_catalog" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product_stock" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_movements" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product_stock" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "product_catalog" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "microbatches" ADD "extra_bag" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "microbatches" ADD "leftover_grams" numeric(8,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "microbatches" ADD "samples_obtained_100g" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "microbatches" ADD "bags_obtained_250g" integer NOT NULL`);
    }

}
