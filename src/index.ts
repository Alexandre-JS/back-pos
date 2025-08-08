import 'reflect-metadata';
import express from 'express';
import { createConnection } from 'typeorm';
import { typeOrmConfig } from './config/typeorm.config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

createConnection(typeOrmConfig)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log('TypeORM connection error: ', error));
