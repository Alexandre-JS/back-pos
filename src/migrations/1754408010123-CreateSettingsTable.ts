import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSettingsTable1754408010123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "settings",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "companyName",
                        type: "varchar",
                        default: "''"
                    },
                    {
                        name: "address",
                        type: "varchar",
                        default: "''"
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        default: "''"
                    },
                    {
                        name: "currency",
                        type: "varchar",
                        default: "'MZN'"
                    },
                    {
                        name: "language",
                        type: "varchar",
                        default: "'pt'"
                    }
                ]
            })
        );

        // Nenhum registro padrão será inserido
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("settings");
    }
}
