import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSalesTables1754411663830 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela sales
        await queryRunner.query(`
            CREATE TABLE "sales" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "saleNumber" varchar NOT NULL UNIQUE,
                "customerId" integer,
                "userId" integer NOT NULL,
                "subtotal" decimal(10,2) NOT NULL,
                "discount" decimal(10,2) NOT NULL DEFAULT (0),
                "total" decimal(10,2) NOT NULL,
                "paymentMethod" varchar NOT NULL,
                "status" varchar NOT NULL DEFAULT ('completed'),
                "createdAt" datetime NOT NULL DEFAULT (datetime('now'))
            )
        `);

        // Criar tabela sale_items
        await queryRunner.query(`
            CREATE TABLE "sale_items" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "saleId" integer NOT NULL,
                "productId" varchar NOT NULL,
                "quantity" integer NOT NULL,
                "unitPrice" decimal(10,2) NOT NULL,
                "subtotal" decimal(10,2) NOT NULL,
                FOREIGN KEY ("saleId") REFERENCES "sales" ("id") ON DELETE CASCADE,
                FOREIGN KEY ("productId") REFERENCES "products" ("id")
            )
        `);

        // Criar índices
        await queryRunner.query(`CREATE INDEX "IDX_sales_userId" ON "sales" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sales_createdAt" ON "sales" ("createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_sale_items_saleId" ON "sale_items" ("saleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sale_items_productId" ON "sale_items" ("productId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índices
        await queryRunner.query(`DROP INDEX "IDX_sale_items_productId"`);
        await queryRunner.query(`DROP INDEX "IDX_sale_items_saleId"`);
        await queryRunner.query(`DROP INDEX "IDX_sales_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_sales_userId"`);
        
        // Remover tabelas
        await queryRunner.query(`DROP TABLE "sale_items"`);
        await queryRunner.query(`DROP TABLE "sales"`);
    }

}
