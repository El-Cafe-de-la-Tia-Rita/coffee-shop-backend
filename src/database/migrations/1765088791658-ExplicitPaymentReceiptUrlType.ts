import { MigrationInterface, QueryRunner } from "typeorm";

export class ExplicitPaymentReceiptUrlType1765088791658 implements MigrationInterface {
    name = 'ExplicitPaymentReceiptUrlType1765088791658'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_receipt_url"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_receipt_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "payment_receipt_url"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "payment_receipt_url" character varying`);
    }

}
