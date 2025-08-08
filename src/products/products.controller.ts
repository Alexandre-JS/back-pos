import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseInterceptors, UploadedFile, Res, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { MovementType } from './entities/stock-movement.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  @Get('low-stock') // Move this endpoint before the :id route to avoid conflict
  async findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get('expiring')
  findExpiring(@Query('days') days: number) {
    return this.productsService.findExpiring(days);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/temp',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
  }))
  importProducts(@UploadedFile() file: any) {
    return this.productsService.importFromCSV(file);
  }

  @Get('export')
  async exportProducts(@Res() res: Response) {
    const buffer = await this.productsService.exportToCSV();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=products-${Date.now()}.csv`
    });
    res.send(buffer);
  }

  @Post(':id/stock')
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Body('type') type: MovementType
  ) {
    if (!Object.values(MovementType).includes(type)) {
      throw new BadRequestException(`Invalid movement type. Must be one of: ${Object.values(MovementType).join(', ')}`);
    }
    return this.productsService.updateStock(id, quantity, type);
  }
}
