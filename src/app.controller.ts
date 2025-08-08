import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      name: 'POS System API', // Pode ser ajustado para buscar das configurações se necessário
      version: '1.0.0',
      endpoints: {
        products: '/products',
        sales: '/sales'
      },
      timestamp: new Date().toISOString()
    };
  }
}
