import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMicrobatchToExpense1767383753488 implements MigrationInterface {
    name = 'AddMicrobatchToExpense1767383753488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" ADD "microbatchId" uuid`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_180f9115f67a90e55cdcdd3a2fc" FOREIGN KEY ("microbatchId") REFERENCES "microbatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_180f9115f67a90e55cdcdd3a2fc"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP COLUMN "microbatchId"`);
    }

}
