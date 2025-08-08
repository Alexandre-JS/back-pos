import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  async findAll() {
    return this.salesService.findAll();
  }

  @Get('today')
  async getTodaySales() {
    return this.salesService.getTodaySales();
  }

  @Get('report')
  async getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.salesService.generateReport({ startDate, endDate });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }
}
