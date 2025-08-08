import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1754405941034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "username" varchar NOT NULL,
                "password" varchar NOT NULL,
                "role" varchar NOT NULL DEFAULT ('user'),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
