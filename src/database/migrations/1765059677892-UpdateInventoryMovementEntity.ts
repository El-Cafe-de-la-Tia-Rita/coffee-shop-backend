import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateInventoryMovementEntity1765059677892 implements MigrationInterface {
    name = 'UpdateInventoryMovementEntity1765059677892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_movements" DROP COLUMN "reason"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_movements_reason_enum" AS ENUM('BATCH_PURCHASE', 'MICROBATCH_PRODUCTION', 'SALE', 'ADJUSTMENT', 'RETURN', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" ADD "reason" "public"."inventory_movements_reason_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_movements" DROP COLUMN "reason"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_movements_reason_enum"`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" ADD "reason" text`);
    }

}
