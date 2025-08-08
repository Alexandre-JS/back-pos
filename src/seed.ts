import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function seed() {
  console.log('🌱 Iniciando seed de dados...');
  
  const app = await NestFactory.create(AppModule);
  const productsService = app.get(ProductsService);

  try {
    // Delete all existing products
    await productsService.deleteAll();

    const products = [
      {
        barcode: '7894900011517',
        name: 'Coca-Cola 500ml',
        description: 'Refrigerante Coca-Cola 500ml',
        salePrice: 25,
        costPrice: 18,
        category: 'Bebidas',
        stock: 100,
        minStock: 10,
        active: true
      },
      {
        barcode: '7891098000676',
        name: 'Água Mineral 500ml',
        description: 'Água Mineral sem gás 500ml',
        salePrice: 8,
        costPrice: 5,
        category: 'Bebidas',
        stock: 150,
        minStock: 20,
        active: true
      },
      {
        barcode: '7892840222949',
        name: 'Salgadinho Doritos',
        description: 'Salgadinho Doritos Queijo Nacho 140g',
        salePrice: 12,
        costPrice: 8,
        category: 'Snacks',
        stock: 80,
        minStock: 15,
        active: true
      },
      {
        barcode: '7891910000197',
        name: 'Chocolate Lacta',
        description: 'Chocolate ao Leite Lacta 90g',
        salePrice: 10,
        costPrice: 6,
        category: 'Doces',
        stock: 120,
        minStock: 25,
        active: true
      }
    ];

    for (const product of products) {
      await productsService.create(product);
    }

    console.log('✅ Dados de teste criados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  } finally {
    await app.close();
  }
}

seed();