import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TransactionsService } from '../service/transactions.service';
import { TransactionDto } from '../dto/transaction.dto';
import { LoggerService } from '../../../common/logger/service/logger.service';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly loggerService: LoggerService
  ) { }

  @Post()
  async createTransaction(@Body() transactionDto: TransactionDto) {
    return this.transactionsService.createTransaction(transactionDto)
      .then(transaction => {
        this.loggerService.info(`Transação realizada com sucesso para a conta origem ${transaction.origem}: ${transaction}`);
        return transaction;
      })
      .catch(error => {
        this.loggerService.error(`Erro ao realizar transação para a conta origem ${transactionDto.origem}: ${error.message}`);
        throw error;
      })
  }

  @Get(':accountNumber')
  async getAllTransactionsByAccountNumber(@Param('accountNumber') accountNumber: string): Promise<Transaction[]> {
    return this.transactionsService.getAllTransactionsByAccountNumber(+accountNumber);
  } 

  @Get('/account-number/:accountNumber/transaction-type/:transactionType')
  async getAllTransactionsByAccountNumberAndTransactionType(
    @Param('accountNumber') accountNumber: string,
    @Param('transactionType') transactionType: TransactionType
  ): Promise<Transaction[]> {
    return this.transactionsService.getTransactionsByAccountNumberAndTransactionType(+accountNumber, transactionType);
  } 
}
