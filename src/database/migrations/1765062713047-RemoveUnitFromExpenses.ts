import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnitFromExpenses1765062713047 implements MigrationInterface {
    name = 'RemoveUnitFromExpenses1765062713047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "unit"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" ADD "unit" character varying NOT NULL`);
    }

}
