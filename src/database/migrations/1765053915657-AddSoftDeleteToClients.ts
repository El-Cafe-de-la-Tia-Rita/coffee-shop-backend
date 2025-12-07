import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToClients1765053915657 implements MigrationInterface {
    name = 'AddSoftDeleteToClients1765053915657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "phone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_aa22377d7d3e794ae4cd39cd9e5" UNIQUE ("phone")`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "address" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "district" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "district" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "address" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_aa22377d7d3e794ae4cd39cd9e5"`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_b48860677afe62cd96e12659482"`);
        await queryRunner.query(`ALTER TABLE "clients" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "deleted_at"`);
    }

}
