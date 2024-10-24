import { Module } from '@nestjs/common';

import { TransactionsController } from './controller/transactions.controller';
import { TransactionsService } from './service/transactions.service';
import { LoggerService } from '../../common/logger/service/logger.service';
import { AccountsService } from '../accounts/service/accounts.service';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    AccountsModule
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, LoggerService, AccountsService],
})
export class TransactionsModule {}
