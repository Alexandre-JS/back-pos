import 'dotenv/config';
import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../config/typeorm.config';

export const AppDataSource = new DataSource({
  ...typeOrmConfig,
  synchronize: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
