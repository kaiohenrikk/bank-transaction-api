import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Account } from '../entities/accounts.entity';
import { AccountsService } from '../service/accounts.service';
import { LoggerService } from '../../../common/logger/service/logger.service';
import { AccountDto } from '../dto/account.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly loggerService: LoggerService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova conta' })
  @ApiResponse({
    status: 201,
    description: 'Conta criada com sucesso',
    type: AccountDto,
  })
  @ApiBody({ type: AccountDto })
  async createAccount(@Body() accountData: AccountDto): Promise<AccountDto> {
    this.loggerService.info(
      `Iniciando processo de criação de conta... ${accountData.numero}`
    );

    return this.accountsService
      .createAccount(accountData)
      .then((account) => {
        this.loggerService.info(`Conta criada com sucesso: ${account.numero}`);
        return account;
      })
      .catch((error) => {
        this.loggerService.error(`Erro ao criar conta: ${error.message}`);
        throw error;
      });
  }

  @Get(':accountNumber')
  @ApiOperation({ summary: 'Busca uma conta pelo número da conta' })
  @ApiResponse({
    status: 200,
    description: 'Conta criada com sucesso',
    type: Account,
  })
  async getAccount(
    @Param('accountNumber') accountNumber: string
  ): Promise<Account> {
    this.loggerService.info(`Iniciando busca da conta... ${accountNumber}`);

    return this.accountsService
      .getAccount(+accountNumber)
      .then((account) => {
        this.loggerService.info(`Conta encontrada: ${accountNumber}`);
        return account;
      })
      .catch((error) => {
        this.loggerService.error(
          `Erro ao buscar conta ${accountNumber}: ${error.message}`
        );
        throw error;
      });
  }

  @Delete(':accountNumber')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta uma conta pelo número da mesma' })
  @ApiResponse({ status: 204, description: 'Conta deletada com sucesso' })
  async deleteAccount(
    @Param('accountNumber') accountNumber: string
  ): Promise<void> {
    this.loggerService.info(
      `Iniciando processo para deletar a conta... ${accountNumber}`
    );

    await this.accountsService
      .deleteAccount(+accountNumber)
      .then(() => {
        this.loggerService.info(
          `A conta ${accountNumber} foi excluída com sucesso`
        );
      })
      .catch((error) => {
        this.loggerService.error(
          `Erro ao deletar conta ${accountNumber}: ${error.message}`
        );
        throw error;
      });
  }
}
