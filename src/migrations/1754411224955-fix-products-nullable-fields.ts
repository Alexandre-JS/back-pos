import { MigrationInterface, QueryRunner } from "typeorm";

export class FixProductsNullableFields1754411224955 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Para SQLite, precisamos recriar a tabela porque não suporta ALTER COLUMN diretamente
        
        // 1. Criar uma nova tabela temporária com a estrutura correta
        await queryRunner.query(`
            CREATE TABLE "products_temp" (
                "id" varchar PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                "barcode" varchar UNIQUE,
                "name" varchar NOT NULL,
                "description" varchar,
                "salePrice" decimal(10,2) NOT NULL,
                "costPrice" decimal(10,2),
                "category" varchar,
                "stock" integer NOT NULL DEFAULT (0),
                "minStock" integer NOT NULL DEFAULT (0),
                "active" boolean NOT NULL DEFAULT (1),
                "created_at" timestamp NOT NULL DEFAULT (datetime('now')),
                "updated_at" timestamp NOT NULL DEFAULT (datetime('now')),
                "promotionalPrice" decimal(10,2),
                "unit" varchar,
                "imageUrl" varchar,
                "expirationDate" date,
                "categoryId" integer
            )
        `);

        // 2. Copiar dados da tabela original para a temporária
        await queryRunner.query(`
            INSERT INTO "products_temp" 
            SELECT * FROM "products"
        `);

        // 3. Deletar a tabela original
        await queryRunner.query(`DROP TABLE "products"`);

        // 4. Renomear a tabela temporária
        await queryRunner.query(`ALTER TABLE "products_temp" RENAME TO "products"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter as mudanças - tornar campos obrigatórios novamente
        await queryRunner.query(`
            CREATE TABLE "products_temp" (
                "id" varchar PRIMARY KEY NOT NULL DEFAULT (uuid_generate_v4()),
                "barcode" varchar UNIQUE NOT NULL,
                "name" varchar NOT NULL,
                "description" varchar,
                "salePrice" decimal(10,2) NOT NULL,
                "costPrice" decimal(10,2) NOT NULL,
                "category" varchar NOT NULL,
                "stock" integer NOT NULL DEFAULT (0),
                "minStock" integer NOT NULL DEFAULT (0),
                "active" boolean NOT NULL DEFAULT (1),
                "created_at" timestamp NOT NULL DEFAULT (datetime('now')),
                "updated_at" timestamp NOT NULL DEFAULT (datetime('now')),
                "promotionalPrice" decimal(10,2),
                "unit" varchar,
                "imageUrl" varchar,
                "expirationDate" date,
                "categoryId" integer
            )
        `);

        await queryRunner.query(`
            INSERT INTO "products_temp" 
            SELECT * FROM "products"
        `);

        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`ALTER TABLE "products_temp" RENAME TO "products"`);
    }

}
