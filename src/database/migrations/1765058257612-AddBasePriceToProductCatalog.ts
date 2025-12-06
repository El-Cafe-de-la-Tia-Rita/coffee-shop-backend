import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBasePriceToProductCatalog1765058257612 implements MigrationInterface {
    name = 'AddBasePriceToProductCatalog1765058257612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_catalog" ADD "base_price" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_catalog" DROP COLUMN "base_price"`);
    }

}
