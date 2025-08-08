import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateStockMovements1687012345680 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar colunas com valores default
    await queryRunner.addColumn(
      'stock_movements',
      new TableColumn({
        name: 'previousStock',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        default: 0
      })
    );

    await queryRunner.addColumn(
      'stock_movements',
      new TableColumn({
        name: 'currentStock',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        default: 0
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('stock_movements', 'previousStock');
    await queryRunner.dropColumn('stock_movements', 'currentStock');
  }
}
