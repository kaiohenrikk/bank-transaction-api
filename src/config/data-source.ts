import { DataSource } from 'typeorm';
import { typeOrmDataSourceOptions } from './database.config'; // Adjust path if needed

export const AppDataSource = new DataSource(typeOrmDataSourceOptions);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
