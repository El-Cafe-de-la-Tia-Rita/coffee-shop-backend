import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoftDeleteToMicroBatches1765057787601 implements MigrationInterface {
    name = 'AddSoftDeleteToMicroBatches1765057787601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "microbatches" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "public"."expenses_category_enum" RENAME TO "expenses_category_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."expenses_category_enum" AS ENUM('TRANSPORT', 'PACKAGING', 'SUPPLIES', 'SERVICES', 'OTHER', 'PURCHASE', 'PRODUCTION')`);
        await queryRunner.query(`ALTER TABLE "expenses" ALTER COLUMN "category" TYPE "public"."expenses_category_enum" USING "category"::"text"::"public"."expenses_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_category_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."expenses_category_enum_old" AS ENUM('TRANSPORT', 'PACKAGING', 'SUPPLIES', 'SERVICES', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "expenses" ALTER COLUMN "category" TYPE "public"."expenses_category_enum_old" USING "category"::"text"::"public"."expenses_category_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."expenses_category_enum_old" RENAME TO "expenses_category_enum"`);
        await queryRunner.query(`ALTER TABLE "microbatches" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "deleted_at"`);
    }

}
