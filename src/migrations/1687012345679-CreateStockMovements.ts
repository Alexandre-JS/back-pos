import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateStockMovements1687012345679 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "stock_movements",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "productId",
                        type: "uuid"
                    },
                    {
                        name: "type",
                        type: "varchar",
                        length: "20"
                    },
                    {
                        name: "quantity",
                        type: "decimal",
                        precision: 10,
                        scale: 2
                    },
                    {
                        name: "reason",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    }
                ]
            })
        );

        await queryRunner.createForeignKey(
            "stock_movements",
            new TableForeignKey({
                columnNames: ["productId"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("stock_movements");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("productId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("stock_movements", foreignKey);
        }
        await queryRunner.dropTable("stock_movements");
    }
}
