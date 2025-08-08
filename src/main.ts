import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Adicione esta linha para permitir CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3000, '0.0.0.0');
  console.log('🚀 Backend rodando em http://0.0.0.0:3000');
}
bootstrap();
