import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToUsers1765051831654 implements MigrationInterface {
    name = 'AddSoftDeleteToUsers1765051831654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    }

}
