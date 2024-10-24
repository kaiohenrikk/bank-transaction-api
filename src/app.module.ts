import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmDataSourceOptions } from './config/database.config';
import { LoggerModule } from './common/logger/logger.module';
import { HealthModule } from './modules/health/health.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmDataSourceOptions),
    LoggerModule,
    HealthModule,
    AccountsModule,
    TransactionsModule,
  ],
})
export class AppModule {}
