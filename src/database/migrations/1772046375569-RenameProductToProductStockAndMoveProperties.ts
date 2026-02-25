import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameProductToProductStockAndMoveProperties1772046375569 implements MigrationInterface {
    name = 'RenameProductToProductStockAndMoveProperties1772046375569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add columns to product_stock as nullable
        await queryRunner.query(`ALTER TABLE "product_stock" ADD "weight_grams" integer`);
        await queryRunner.query(`ALTER TABLE "product_stock" ADD "package_type" character varying`);

        // 2. Transfer data from product_catalog to product_stock
        await queryRunner.query(`
            UPDATE "product_stock"
            SET "weight_grams" = pc."weight_grams",
                "package_type" = pc."package_type"
            FROM "product_catalog" pc
            WHERE "product_stock"."productCatalogId" = pc."id"
        `);

        // 3. Set columns to NOT NULL after data transfer
        // Note: We might want to handle cases where there's no matching catalog, 
        // but in this system product_stock should always have a catalog.
        // We'll set a default just in case for existing records that might fail.
        await queryRunner.query(`UPDATE "product_stock" SET "weight_grams" = 0 WHERE "weight_grams" IS NULL`);
        await queryRunner.query(`UPDATE "product_stock" SET "package_type" = 'UNKNOWN' WHERE "package_type" IS NULL`);
        
        await queryRunner.query(`ALTER TABLE "product_stock" ALTER COLUMN "weight_grams" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_stock" ALTER COLUMN "package_type" SET NOT NULL`);

        // 4. Drop columns from product_catalog
        await queryRunner.query(`ALTER TABLE "product_catalog" DROP COLUMN "weight_grams"`);
        await queryRunner.query(`ALTER TABLE "product_catalog" DROP COLUMN "package_type"`);

        // 5. Handle Enum rename/update if needed (from original generated migration)
        await queryRunner.query(`ALTER TYPE "public"."product_stock_grind_type_enum" RENAME TO "product_stock_grind_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."product_stock_grind_type_enum" AS ENUM('WHOLE_BEAN', 'GROUND', 'COARSE', 'MEDIUM', 'FINE', 'EXTRA_FINE')`);
        await queryRunner.query(`ALTER TABLE "product_stock" ALTER COLUMN "grind_type" TYPE "public"."product_stock_grind_type_enum" USING "grind_type"::"text"::"public"."product_stock_grind_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."product_stock_grind_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add columns to product_catalog
        await queryRunner.query(`ALTER TABLE "product_catalog" ADD "package_type" character varying`);
        await queryRunner.query(`ALTER TABLE "product_catalog" ADD "weight_grams" integer`);

        // Transfer data back if possible (though it might be ambiguous if multiple stocks have different values for same catalog)
        // Here we just take the first one found or leave it for manual fix as "down" is usually for emergency.
        await queryRunner.query(`
            UPDATE "product_catalog"
            SET "weight_grams" = ps."weight_grams",
                "package_type" = ps."package_type"
            FROM "product_stock" ps
            WHERE "product_catalog"."id" = ps."productCatalogId"
        `);

        // Set NOT NULL
        await queryRunner.query(`UPDATE "product_catalog" SET "weight_grams" = 0 WHERE "weight_grams" IS NULL`);
        await queryRunner.query(`UPDATE "product_catalog" SET "package_type" = 'UNKNOWN' WHERE "package_type" IS NULL`);
        await queryRunner.query(`ALTER TABLE "product_catalog" ALTER COLUMN "weight_grams" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_catalog" ALTER COLUMN "package_type" SET NOT NULL`);

        // Enum revert
        await queryRunner.query(`CREATE TYPE "public"."product_stock_grind_type_enum_old" AS ENUM('WHOLE_BEAN', 'COARSE', 'MEDIUM', 'FINE', 'EXTRA_FINE')`);
        await queryRunner.query(`ALTER TABLE "product_stock" ALTER COLUMN "grind_type" TYPE "public"."product_stock_grind_type_enum_old" USING "grind_type"::"text"::"public"."product_stock_grind_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."product_stock_grind_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."product_stock_grind_type_enum_old" RENAME TO "product_stock_grind_type_enum"`);

        // Drop from stock
        await queryRunner.query(`ALTER TABLE "product_stock" DROP COLUMN "package_type"`);
        await queryRunner.query(`ALTER TABLE "product_stock" DROP COLUMN "weight_grams"`);
    }

}
