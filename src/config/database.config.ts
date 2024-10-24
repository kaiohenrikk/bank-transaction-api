import { DataSourceOptions } from 'typeorm';
import { Account } from '../entities/account.entity';

export const typeOrmDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: 5432,
  username: "banktransactionuser",
  password: "banktransactionpassword",
  database: "prod_banking_system",
  entities: [Account],
  synchronize: true,
};