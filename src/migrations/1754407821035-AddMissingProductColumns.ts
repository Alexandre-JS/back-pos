import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMissingProductColumns1754407821035 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add promotionalPrice column
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "promotionalPrice",
                type: "decimal",
                precision: 10,
                scale: 2,
                isNullable: true
            })
        );

        // Add unit column
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "unit",
                type: "varchar",
                isNullable: true
            })
        );

        // Add imageUrl column
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "imageUrl",
                type: "varchar",
                isNullable: true
            })
        );

        // Add expirationDate column
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "expirationDate",
                type: "date",
                isNullable: true
            })
        );

        // Add categoryId column
        await queryRunner.addColumn(
            "products",
            new TableColumn({
                name: "categoryId",
                type: "int",
                isNullable: true
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("products", "categoryId");
        await queryRunner.dropColumn("products", "expirationDate");
        await queryRunner.dropColumn("products", "imageUrl");
        await queryRunner.dropColumn("products", "unit");
        await queryRunner.dropColumn("products", "promotionalPrice");
    }
}
