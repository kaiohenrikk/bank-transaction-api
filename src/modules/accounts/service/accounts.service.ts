import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '../entities/accounts.entity'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>
) {}

  async createAccount(accountData: Partial<Account>): Promise<Account> {
    return this.accountsRepository.save(accountData);
  }

  async getAccount(accountNumber: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { accountNumber } });

    if (!account) {
        throw new NotFoundException(`Conta de número ${accountNumber} não encontrada`);
      }

    return account;
}

  async updateAccount(accountNumber: string, accountData: Partial<Account>): Promise<Account> {
    const account = await this.getAccount(accountNumber);

    if (!account) {
        throw new NotFoundException(`Conta de número ${accountNumber} não encontrado`);
    }

    Object.assign(account, accountData);
    return await this.accountsRepository.save(account);
  }

  async deleteAccount(accountNumber: string): Promise<boolean> {
    const result = await this.accountsRepository.delete({ accountNumber });
    return (result?.affected ?? 0) > 0;
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountsRepository.find();
  }
}
