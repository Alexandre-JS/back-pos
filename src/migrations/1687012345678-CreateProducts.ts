import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProducts1687012345678 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "products",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "barcode",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        name: "name",
                        type: "varchar"
                    },
                    {
                        name: "description",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "salePrice",
                        type: "decimal",
                        precision: 10,
                        scale: 2
                    },
                    {
                        name: "costPrice",
                        type: "decimal",
                        precision: 10,
                        scale: 2
                    },
                    {
                        name: "category",
                        type: "varchar"
                    },
                    {
                        name: "stock",
                        type: "int"
                    },
                    {
                        name: "minStock",
                        type: "int"
                    },
                    {
                        name: "active",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("products");
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }
}
