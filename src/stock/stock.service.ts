import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement, MovementType } from '../products/entities/stock-movement.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    private productsService: ProductsService
  ) {}

  async create(createMovementDto: any) {
    const product = await this.productsService.findOne(createMovementDto.productId);
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Validar estoque para saídas
    if (createMovementDto.type === MovementType.OUT && product.stock < createMovementDto.quantity) {
      throw new Error('Estoque insuficiente');
    }

    // Usar o método updateStock do ProductsService que já cria a movimentação
    return this.productsService.updateStock(
      createMovementDto.productId,
      createMovementDto.quantity,
      createMovementDto.type as MovementType,
      createMovementDto.reason
    );
  }

  findAll() {
    return this.stockMovementRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' }
    });
  }
}
