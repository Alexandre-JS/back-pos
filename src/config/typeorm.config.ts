import { ConnectionOptions } from 'typeorm';
// Importa apenas opções genéricas se necessário
// import { databaseConfig } from './database';

export const typeOrmConfig: ConnectionOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // ou false em produção
};
