import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1765045093798 implements MigrationInterface {
    name = 'InitialMigration1765045093798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_catalog" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "weight_grams" integer NOT NULL, "package_type" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_924e959bbbe0b7a7f8429a56069" UNIQUE ("code"), CONSTRAINT "PK_43fc6ce23925dbaa92fea160f71" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."expenses_category_enum" AS ENUM('TRANSPORT', 'PACKAGING', 'SUPPLIES', 'SERVICES', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."expenses_payment_method_enum" AS ENUM('CASH', 'CARD', 'TRANSFER', 'YAPE', 'PLIN', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "category" "public"."expenses_category_enum" NOT NULL, "concept" character varying NOT NULL, "description" text, "quantity" numeric(12,2) NOT NULL, "unit" character varying NOT NULL, "amount" numeric(12,2) NOT NULL, "provider" character varying NOT NULL, "receipt_url" character varying NOT NULL, "payment_method" "public"."expenses_payment_method_enum" NOT NULL, "responsible" character varying NOT NULL, "observations" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "batchId" uuid, CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" text NOT NULL, "district" character varying NOT NULL, "notes" text, "first_purchase" TIMESTAMP, "last_purchase" TIMESTAMP, "marketing_opt_in" boolean NOT NULL DEFAULT true, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "unit_price" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "sold_kg" numeric(12,3) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid, "productStockId" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_method_enum" AS ENUM('CASH', 'CARD', 'TRANSFER', 'YAPE', 'PLIN', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_origin_enum" AS ENUM('WHATSAPP', 'WEBSITE', 'INSTAGRAM', 'PHONE', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_number" character varying NOT NULL, "order_date" TIMESTAMP NOT NULL, "delivery_date_estimated" date, "delivery_date_real" date, "status" "public"."orders_status_enum" NOT NULL, "subtotal" numeric(12,2) NOT NULL, "discount" numeric(12,2) NOT NULL, "shipping" numeric(12,2) NOT NULL, "total" numeric(12,2) NOT NULL, "payment_method" "public"."orders_payment_method_enum" NOT NULL, "payment_confirmed" boolean NOT NULL DEFAULT false, "payment_receipt_url" character varying, "notes" text, "delivery_address" text NOT NULL, "origin" "public"."orders_origin_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "clientId" uuid, "createdById" uuid, CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'STAFF', 'MANAGER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_movements_movement_type_enum" AS ENUM('INBOUND', 'OUTBOUND', 'ADJUSTMENT')`);
        await queryRunner.query(`CREATE TABLE "inventory_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "movement_type" "public"."inventory_movements_movement_type_enum" NOT NULL, "quantity" integer NOT NULL, "unit" character varying NOT NULL, "reason" text, "reference" character varying, "movement_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "productStockId" uuid, "batchId" uuid, "userId" uuid, CONSTRAINT "PK_d7597827c1dcffae889db3ab873" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."batch_status_enum" AS ENUM('RAW', 'IN_PROCESS', 'FINISHED')`);
        await queryRunner.query(`CREATE TABLE "batch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "purchase_date" date NOT NULL, "green_kg" numeric(12,2) NOT NULL, "green_kg_available" numeric(12,2) NOT NULL, "producer" character varying NOT NULL, "origin" character varying NOT NULL, "variety" character varying NOT NULL, "process" character varying NOT NULL, "altitude_masl" integer NOT NULL, "total_cost" numeric(12,2) NOT NULL, "cost_per_kg" numeric(12,2) NOT NULL, "status" "public"."batch_status_enum" NOT NULL, "observations" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7efda0353e91e7445e5960f48c7" UNIQUE ("code"), CONSTRAINT "PK_57da3b830b57bec1fd329dcaf43" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."microbatches_roast_type_enum" AS ENUM('LIGHT', 'MEDIUM', 'DARK')`);
        await queryRunner.query(`CREATE TABLE "microbatches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "roast_number" integer NOT NULL, "roast_date" date NOT NULL, "green_kg_used" numeric(12,2) NOT NULL, "roasted_kg_obtained" numeric(12,2) NOT NULL, "loss_kg" numeric(12,2) NOT NULL, "loss_percentage" numeric(5,2) NOT NULL, "roast_type" "public"."microbatches_roast_type_enum" NOT NULL, "roast_responsible" character varying NOT NULL, "bags_obtained_250g" integer NOT NULL, "samples_obtained_100g" integer NOT NULL, "leftover_grams" numeric(8,2) NOT NULL, "extra_bag" boolean NOT NULL, "observations" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "batchId" uuid, CONSTRAINT "UQ_af924110ef87a43b9f005f9e5ee" UNIQUE ("code"), CONSTRAINT "PK_86fd91fe37e5ffd1bfdff0a6e22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_stock_grind_type_enum" AS ENUM('WHOLE_BEAN', 'COARSE', 'MEDIUM', 'FINE', 'EXTRA_FINE')`);
        await queryRunner.query(`CREATE TABLE "product_stock" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying NOT NULL, "grind_type" "public"."product_stock_grind_type_enum" NOT NULL, "stock_current" integer NOT NULL, "stock_reserved" integer NOT NULL, "stock_minimum" integer NOT NULL, "sale_price" numeric(12,2) NOT NULL, "unit_cost" numeric(12,2) NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "productCatalogId" uuid, "microbatchId" uuid, CONSTRAINT "UQ_d16ada4cb06abc115302a3eff91" UNIQUE ("sku"), CONSTRAINT "PK_557112c9955555e7d08fa913f3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_97ddb95919fa943d7a8f3bfeaa1" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_1b8e96b4eacfdd91f9eb3941d93" FOREIGN KEY ("productStockId") REFERENCES "product_stock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1457f286d91f271313fded23e53" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_39b1402eea81b07616277578fa5" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_6a8c69a7e88e575f66874fda6a9" FOREIGN KEY ("productStockId") REFERENCES "product_stock"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_84d6a5dfabcba0efbf7ed3e7ded" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_7fd6b141c027be66629d76f26b7" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "microbatches" ADD CONSTRAINT "FK_407aa66972948f2e95a878cf9ef" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_stock" ADD CONSTRAINT "FK_a3eb966765991f07b81d0f55d72" FOREIGN KEY ("productCatalogId") REFERENCES "product_catalog"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_stock" ADD CONSTRAINT "FK_c4cc7e25b1490e4362fcdb6ec3c" FOREIGN KEY ("microbatchId") REFERENCES "microbatches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_stock" DROP CONSTRAINT "FK_c4cc7e25b1490e4362fcdb6ec3c"`);
        await queryRunner.query(`ALTER TABLE "product_stock" DROP CONSTRAINT "FK_a3eb966765991f07b81d0f55d72"`);
        await queryRunner.query(`ALTER TABLE "microbatches" DROP CONSTRAINT "FK_407aa66972948f2e95a878cf9ef"`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_7fd6b141c027be66629d76f26b7"`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_84d6a5dfabcba0efbf7ed3e7ded"`);
        await queryRunner.query(`ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_6a8c69a7e88e575f66874fda6a9"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_39b1402eea81b07616277578fa5"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1457f286d91f271313fded23e53"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_1b8e96b4eacfdd91f9eb3941d93"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_97ddb95919fa943d7a8f3bfeaa1"`);
        await queryRunner.query(`DROP TABLE "product_stock"`);
        await queryRunner.query(`DROP TYPE "public"."product_stock_grind_type_enum"`);
        await queryRunner.query(`DROP TABLE "microbatches"`);
        await queryRunner.query(`DROP TYPE "public"."microbatches_roast_type_enum"`);
        await queryRunner.query(`DROP TABLE "batch"`);
        await queryRunner.query(`DROP TYPE "public"."batch_status_enum"`);
        await queryRunner.query(`DROP TABLE "inventory_movements"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_movements_movement_type_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_origin_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TABLE "expenses"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`);
        await queryRunner.query(`DROP TABLE "product_catalog"`);
    }

}
