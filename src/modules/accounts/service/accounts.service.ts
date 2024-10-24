import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Account } from '../entities/accounts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountDto } from '../dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>
  ) { }

  async createAccount(createAccount: AccountDto): Promise<AccountDto> {
    const accountData: Partial<Account> = {
      accountNumber: createAccount.numero,
      balance: createAccount.saldo
    }

    const account = await this.getAccount(createAccount.numero)
      .catch(() => null);

    if (account) {
      throw new ConflictException(`Conta com o número ${createAccount.numero} já existe. Crie uma nova.`);
    }

    return this.accountsRepository.save(accountData)
      .then((account) => ({
        numero: account.accountNumber,
        saldo: account.balance
      }) as AccountDto)
  }

  async getAccount(accountNumber: number): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { accountNumber } });

    if (!account) {
      throw new NotFoundException(`Conta de número ${accountNumber} não encontrada`);
    }

    return account;
  }

  async updateAccount(accountData: Partial<Account>): Promise<Account> {
    accountData.updatedAt = new Date();
    return await this.accountsRepository.save(accountData);
  }

  async deleteAccount(accountNumber: number): Promise<void> {
    const result = await this.accountsRepository.delete({ accountNumber });

    if (result.affected === 0) {
      throw new NotFoundException(`Account with number ${accountNumber} not found`);
    }
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.accountsRepository.find();
  }
}
