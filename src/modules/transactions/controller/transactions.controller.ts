import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TransactionsService } from '../service/transactions.service';
import { TransactionDto } from '../dto/transaction.dto';
import { LoggerService } from '../../../common/logger/service/logger.service';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly loggerService: LoggerService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Realiza uma transação' })
  @ApiResponse({
    status: 201,
    description: 'Transação realizada com sucesso',
    type: TransactionDto,
  })
  @ApiBody({ type: TransactionDto })
  async createTransaction(@Body() transactionDto: TransactionDto) {
    return this.transactionsService
      .createTransaction(transactionDto)
      .then((transaction) => {
        this.loggerService.info(
          `Transação realizada com sucesso para a conta origem ${transaction.origem}`
        );
        return transaction;
      })
      .catch((error) => {
        this.loggerService.error(
          `Erro ao realizar transação para a conta origem ${transactionDto.origem}: ${error.message}`
        );
        throw error;
      });
  }

  @Get(':accountNumber')
  @ApiOperation({ summary: 'Busca transações pelo número da conta' })
  @ApiResponse({
    status: 200,
    description: 'Conta criada com sucesso',
    type: [Transaction],
  })
  async getAllTransactionsByAccountNumber(
    @Param('accountNumber') accountNumber: string
  ): Promise<Transaction[]> {
    return this.transactionsService.getAllTransactionsByAccountNumber(
      +accountNumber
    );
  }

  @Get('/account-number/:accountNumber/transaction-type/:transactionType')
  @ApiOperation({
    summary: 'Busca transações pelo número da conta e tipo de transação',
  })
  @ApiResponse({
    status: 200,
    description: 'Conta criada com sucesso',
    type: [Transaction],
  })
  async getAllTransactionsByAccountNumberAndTransactionType(
    @Param('accountNumber') accountNumber: string,
    @Param('transactionType') transactionType: TransactionType
  ): Promise<Transaction[]> {
    return this.transactionsService.getTransactionsByAccountNumberAndTransactionType(
      +accountNumber,
      transactionType
    );
  }
}
