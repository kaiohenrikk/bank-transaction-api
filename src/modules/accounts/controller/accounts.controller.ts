import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { Account } from '../entities/accounts.entity';
import { AccountsService } from '../service/accounts.service';
import { LoggerService } from '../../../common/logger/service/logger.service';
import { CreateAccount } from '../model/create-account.model';

@Controller('accounts')
export class AccountsController {
    constructor(
        private readonly accountsService: AccountsService,
        private readonly loggerService: LoggerService
    ) { }

    @Post()
    async create(@Body() accountData: CreateAccount): Promise<Account> {
        this.loggerService.info(`Iniciando processo de criação de conta... ${accountData}`);

        return this.accountsService.createAccount(accountData)
            .then((account) => {
                this.loggerService.info(`Conta criada com sucesso: ${account.accountNumber}`);
                return account;
            })
            .catch((error) => {
                this.loggerService.error(`Erro ao criar conta: ${error.message}`);
                throw error;
            })
    }

    @Get(':accountNumber')
    async get(@Param('accountNumber') accountNumber: string): Promise<Account> {
        this.loggerService.info(`Iniciando busca da conta... ${accountNumber}`);

        return this.accountsService.getAccount(accountNumber)
            .then((account) => {
                this.loggerService.info(`Conta encontrada: ${accountNumber}`);
                return account;
            })
            .catch((error) => {
                this.loggerService.error(`Erro ao buscar conta ${accountNumber}: ${error.message}`);
                throw error;
            })
    }

    @Delete(':accountNumber')
    async delete(@Param('accountNumber') accountNumber: string): Promise<boolean> {
        this.loggerService.info(`Iniciando processo para deletar a conta... ${accountNumber}`);

        return this.accountsService.deleteAccount(accountNumber)
            .then((isDeleted) => {
                this.loggerService.info(`${isDeleted ? `Conta ${accountNumber} deletada` : `Conta ${accountNumber} não encontrada`}`);
                return isDeleted;
            })
            .catch((error) => {
                this.loggerService.error(`Erro ao deletar conta ${accountNumber}: ${error.message}`);
                throw error;
            })
    }
}
