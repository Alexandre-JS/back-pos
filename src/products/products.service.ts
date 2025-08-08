import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Like, Connection } from 'typeorm';
import { Product } from './entities/product.entity';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { parse } from 'csv-parse';
import { utils as xlsxUtils, write as xlsxWrite } from 'xlsx';
import { createReadStream } from 'fs';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    private connection: Connection,
    private settingsService: SettingsService // Adicionado
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(search?: string): Promise<any[]> {
    const products = search ? await this.productsRepository.find({
      where: [
        { name: Like(`%${search}%`) },
        { barcode: Like(`%${search}%`) }
      ],
      order: { name: 'ASC' }
    }) : await this.productsRepository.find({
      where: { active: true },
      order: { name: 'ASC' }
    });
    const settings = await this.settingsService.getSettings();
    return products.map(product => ({
      ...product,
      currency: settings.currency
    }));
  }

  async findOne(id: string): Promise<any> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const settings = await this.settingsService.getSettings();
    return {
      ...product,
      currency: settings.currency
    };
  }

  async findByBarcode(barcode: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { barcode } });
    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: Partial<CreateProductDto>): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.update(id, { active: false });
  }
  async deleteAll() {
    return this.productsRepository.clear();
  }

  async findLowStock(): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.stock <= product.minStock')
      .orWhere('product.stock <= :zero', { zero: 0 })
      .orderBy('product.stock', 'ASC')
      .getMany();
  }

  async findExpiring(daysThreshold: number = 30): Promise<Product[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.productsRepository.find({
      where: {
        expirationDate: LessThan(thresholdDate),
        active: true
      }
    });
  }

  async importFromCSV(file: any): Promise<void> {
    const products: any[] = [];
    
    const parser = parse({
      columns: true,
      skip_empty_lines: true
    });

    return new Promise((resolve, reject) => {
      createReadStream(file.path)
        .pipe(parser)
        .on('data', (data) => products.push(data))
        .on('end', async () => {
          try {
            await this.productsRepository.save(products);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  async exportToCSV(): Promise<any> {
    const products = await this.findAll();
    const workbook = xlsxUtils.book_new();
    const worksheet = xlsxUtils.json_to_sheet(products);
    xlsxUtils.book_append_sheet(workbook, worksheet, 'Products');
    return xlsxWrite(workbook, { type: 'buffer', bookType: 'csv' });
  }

  async updateStock(
    productId: string,
    quantity: number,
    type: MovementType,
    reason?: string
  ): Promise<Product> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await this.findOne(productId);

      if (type === MovementType.OUT && product.stock < quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      // Create movement record
      const movement = this.stockMovementRepository.create({
        productId,
        quantity,
        type,
        reason
      });
      await this.stockMovementRepository.save(movement);

      // Update product stock
      product.stock = type === MovementType.IN ? 
        product.stock + quantity : 
        product.stock - quantity;
      
      const updatedProduct = await this.productsRepository.save(product);
      await queryRunner.commitTransaction();
      
      return updatedProduct;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
