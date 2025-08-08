const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Nunca usar migrations com synchronize: true
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});

module.exports = { AppDataSource };
