import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToExpenses1765061180961 implements MigrationInterface {
    name = 'AddSoftDeleteToExpenses1765061180961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "deleted_at"`);
    }

}
