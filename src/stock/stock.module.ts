import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockMovement } from '../products/entities/stock-movement.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement]),
    ProductsModule
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [StockService]
})
export class StockModule {}
