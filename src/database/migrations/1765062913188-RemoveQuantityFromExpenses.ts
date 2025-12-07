import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveQuantityFromExpenses1765062913188 implements MigrationInterface {
    name = 'RemoveQuantityFromExpenses1765062913188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "quantity"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" ADD "quantity" numeric(12,2) NOT NULL`);
    }

}
