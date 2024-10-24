import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { AccountsService } from '../../accounts/service/accounts.service';
import { Account } from '../../accounts/entities/accounts.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionDto } from '../dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly accountsService: AccountsService,
  ) { }

  private async getAccount(accountNumber: number): Promise<Account> {
    try {
      return await this.accountsService.getAccount(accountNumber);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(
          `Conta de número ${accountNumber} não encontrada. Necessário criar uma conta.`,
        );
      }
      throw error;
    }
  }

  private async transfer(transactionData: TransactionDto): Promise<TransactionDto> {
    if (!transactionData.destino || !transactionData.origem) {
      throw new BadRequestException(
        `Para transferência, o campo 'destino' e 'origem' devem ser preenchidos.`,
      );
    }

    const [getAccountFrom, getAccountTo] = await Promise.all([
      this.getAccount(transactionData.origem!),
      this.getAccount(transactionData.destino!),
    ]);

    this.validateAccountBalance(getAccountFrom.balance, transactionData.valor, getAccountFrom.accountNumber);

    getAccountFrom.balance -= transactionData.valor
    getAccountTo.balance += transactionData.valor

    await Promise.all([
      this.accountsService.updateAccount(getAccountFrom),
      this.accountsService.updateAccount(getAccountTo),
    ]);

    return this.createTransactionResponse(
      getAccountFrom.accountNumber,
      transactionData.valor,
      transactionData.tipo,
      getAccountTo.accountNumber,
    );
  }

  private validateAccountBalance(accountBalance: number, transactionValue: number, accountNumber: number): void {
    if (accountBalance < transactionValue) {
      throw new UnprocessableEntityException(
        `Saldo insuficiente para realizar a transação. Conta: ${accountNumber}. Saldo: ${accountBalance}. Transação: ${transactionValue}.`,
      );
    }
  }

  private createTransactionResponse(
    origem: number,
    valor: number,
    tipo: TransactionType,
    destino?: number,
  ): TransactionDto {
    return {
      tipo,
      origem,
      destino,
      valor
    } as TransactionDto;
  }

  private static handleBalanceOperation(
    transactionType: TransactionType,
    balance: number,
    transactionAmount: number,
  ): number {
    return transactionType === TransactionType.DEPOSIT
      ? balance + transactionAmount 
      : balance - transactionAmount;
  }

  async createTransaction(transactionData: TransactionDto): Promise<TransactionDto> {
    if (transactionData.tipo === TransactionType.TRANSFER) {
      return this.transfer(transactionData);
    }

    const getAccount = await this.getAccount(transactionData.origem);

    if (transactionData.tipo === TransactionType.WITHDRAWAL) {
      this.validateAccountBalance(getAccount.balance, transactionData.valor, getAccount.accountNumber);
    }

    getAccount.balance = TransactionsService.handleBalanceOperation(
      transactionData.tipo,
      getAccount.balance,
      transactionData.valor,
    );

    await this.accountsService.updateAccount(getAccount);

    return this.createTransactionResponse(getAccount.accountNumber, transactionData.valor, transactionData.tipo);
  }

  async getAllTransactionsByAccountNumber(accountNumber: number): Promise<Transaction[]> {
    const getAccount = await this.getAccount(accountNumber);
    const transactions = await this.transactionsRepository.find({
      relations: ['account'],
      where: { account: { accountNumber: getAccount.accountNumber } },
    });

    if (!transactions.length) {
      throw new NotFoundException(`Não existem transações para a conta ${accountNumber}`);
    }

    return transactions;
  }

  async getTransactionsByAccountNumberAndTransactionType(accountNumber: number, type: TransactionType): Promise<Transaction[]> {
    const getAccount = await this.getAccount(accountNumber);
    const transactions = await this.transactionsRepository.find({
      relations: ['account'],
      where: { account: { accountNumber: getAccount.accountNumber }, type },
    });

    if (!transactions.length) {
      throw new NotFoundException(`Não existem transações do tipo ${type} para a conta ${accountNumber}`);
    }

    return transactions;
  }
}
