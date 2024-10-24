import { Controller, Post, Get, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Account } from '../entities/accounts.entity';
import { AccountsService } from '../service/accounts.service';
import { LoggerService } from '../../../common/logger/service/logger.service';
import { CreateAccountDto } from '../dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
    constructor(
        private readonly accountsService: AccountsService,
        private readonly loggerService: LoggerService
    ) { }

    @Post()
    async create(@Body() accountData: CreateAccountDto): Promise<CreateAccountDto> {
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
    @HttpCode(HttpStatus.NO_CONTENT) 
    async delete(@Param('accountNumber') accountNumber: string): Promise<void> {
        this.loggerService.info(`Iniciando processo para deletar a conta... ${accountNumber}`);

        await this.accountsService.deleteAccount(accountNumber)
            .then(() => {
                this.loggerService.info(`A conta ${accountNumber} foi excluída com sucesso`);
            })
            .catch((error) => {
                this.loggerService.error(`Erro ao deletar conta ${accountNumber}: ${error.message}`);
                throw error;
            })
    }
}
