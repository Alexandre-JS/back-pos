import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from '../products/products.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepository: Repository<SaleItem>,
    private productsService: ProductsService,
    private settingsService: SettingsService // Adicionado
  ) {}

  async create(createSaleDto: CreateSaleDto): Promise<any> {
    const saleNumber = `POS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    let subtotal = 0;
    const items: SaleItem[] = [];
    
    // Validar todos os produtos primeiro
    await Promise.all(createSaleDto.items.map(async (item) => {
      const product = await this.productsService.findOne(item.productId);
      if (!product) {
        throw new NotFoundException(`Produto ${item.productId} não encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}`);
      }
    }));

    // Processar itens após validação
    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productId);
      const itemSubtotal = item.quantity * product.salePrice;
      
      items.push({
        product,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        subtotal: itemSubtotal,
      } as SaleItem);
      
      subtotal += itemSubtotal;
      
      await this.productsService.update(product.id, {
        stock: product.stock - item.quantity
      });
    }
    
    const total = subtotal - (createSaleDto.discount || 0);
    
    // Criar venda
    const sale = this.salesRepository.create({
      saleNumber,
      customerId: createSaleDto.customerId,
      userId: createSaleDto.userId,
      subtotal,
      discount: createSaleDto.discount || 0,
      total,
      paymentMethod: createSaleDto.paymentMethod,
      items,
    });
    const savedSale = await this.salesRepository.save(sale);
    const settings = await this.settingsService.getSettings();
    return {
      ...savedSale,
      currency: settings.currency
    };
  }

  async findAll(): Promise<any[]> {
    const sales = await this.salesRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });
    const settings = await this.settingsService.getSettings();
    return sales.map(sale => ({
      ...sale,
      currency: settings.currency
    }));
  }

  async findOne(id: number): Promise<any> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['items', 'items.product']
    });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    const settings = await this.settingsService.getSettings();
    return {
      ...sale,
      currency: settings.currency
    };
  }

  async getTodaySales(): Promise<{ total: number; count: number }> {
    try {
      // Usar raw query para debug
      const rawSales = await this.salesRepository.query(`
        SELECT * FROM sales 
        WHERE date(createdAt) = date('now')
      `);
      
      console.log('Raw sales query result:', rawSales);

      const total = rawSales.reduce((sum: number, sale: any) => sum + Number(sale.total), 0);
      
      console.log('Calculated totals:', { count: rawSales.length, total });
      
      return {
        total,
        count: rawSales.length
      };
    } catch (error) {
      console.error('Error getting today sales:', error);
      return { total: 0, count: 0 };
    }
  }

  async generateReport(params: { startDate: string; endDate: string }) {
    try {
      const settings = await this.settingsService.getSettings();
      // Busca vendas com itens e produtos usando SQL diretamente
      const sales = await this.salesRepository.query(
        `SELECT 
          date(s.createdAt) as date,
          COUNT(*) as sales,
          SUM(s.total) as revenue,
          SUM(
            (si.unitPrice - p.costPrice) * si.quantity
          ) as profit
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.saleId
        LEFT JOIN products p ON si.productId = p.id
        WHERE date(s.createdAt) BETWEEN date(?) AND date(?)
        GROUP BY date(s.createdAt)
        ORDER BY date(s.createdAt)`,
        [params.startDate, params.endDate]
      );

      console.log('Sales report data:', sales);

      return {
        company: {
          name: settings.companyName,
          address: settings.address,
          phone: settings.phone,
          currency: settings.currency
        },
        report: sales.map(row => ({
          date: new Date(row.date),
          sales: Number(row.sales),
          revenue: Number(row.revenue),
          profit: Number(row.profit) || 0
        }))
      };
    } catch (error) {
      console.error('Error generating sales report:', error);
      return { company: null, report: [] };
    }
  }

  private calculateSaleDetails(items: SaleItem[]) {
    let subtotal = 0;
    let profit = 0;

    for (const item of items) {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemProfit = item.quantity * (item.unitPrice - item.product.costPrice);
      
      subtotal += itemSubtotal;
      profit += itemProfit;
    }

    return { subtotal, profit };
  }
}
