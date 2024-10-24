import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './controller/accounts.controller';
import { AccountsService } from './service/accounts.service';
import { Account } from './entities/accounts.entity';
import { LoggerService } from '../../common/logger/service/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountsController],
  providers: [AccountsService, LoggerService],
  exports: [AccountsService, TypeOrmModule],
})
export class AccountsModule {}
