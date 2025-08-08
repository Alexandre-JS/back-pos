import { Controller, Get, Post, Body } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('movements')
  create(@Body() createMovementDto: any) {
    return this.stockService.create(createMovementDto);
  }

  @Get('movements')
  findAll() {
    return this.stockService.findAll();
  }
}
