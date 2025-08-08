import { Connection, createConnection } from 'typeorm';
import { typeOrmConfig } from '../config/typeorm.config';

export const createAppDataSource = async (): Promise<Connection> => {
  return await createConnection({
    ...typeOrmConfig,
    synchronize: false, // Nunca usar migrations com synchronize: true
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  });
};
