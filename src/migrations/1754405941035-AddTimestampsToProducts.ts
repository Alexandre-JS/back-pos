import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTimestampsToProducts1754405941035 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Skip this migration as the columns already exist
        // Check showed the columns are already in the schema:
        // CREATE TABLE "products" ("id" uuid PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()), 
        // "barcode" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar, 
        // "salePrice" decimal(10,2) NOT NULL, "costPrice" decimal(10,2) NOT NULL, 
        // "category" varchar NOT NULL, "stock" int NOT NULL, "minStock" int NOT NULL, 
        // "active" boolean NOT NULL DEFAULT (true), "created_at" timestamp NOT NULL DEFAULT (now()), 
        // "updated_at" timestamp NOT NULL DEFAULT (now()))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Nothing to do as we're not making changes
    }
}
