import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../../../src/modules/accounts/entities/accounts.entity';
import { AppModule } from '../../../../src/app.module';
import { AccountDto } from '../../../../src/modules/accounts/dto/account.dto';

describe('AccountsController', () => {
  let app: INestApplication;
  let accountRepository: Repository<Account>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    accountRepository = moduleFixture.get<Repository<Account>>(getRepositoryToken(Account));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await accountRepository.delete({});
  });

  it('POST /accounts - should create a new account', async () => {
    const createAccountDto: AccountDto = { numero: 123456, saldo: 100 };
    
    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send(createAccountDto)
      .expect(201);

    expect(response.body).toHaveProperty('numero', createAccountDto.numero);
    expect(response.body).toHaveProperty('saldo', createAccountDto.saldo);
  });

  it('GET /accounts/:accountNumber - should return an account', async () => {
    const account = await accountRepository.save({ accountNumber: 123456, balance: 100 });

    const response = await request(app.getHttpServer())
      .get(`/accounts/${account.accountNumber}`)
      .expect(200);

    expect(response.body).toEqual(expect.objectContaining({
      accountNumber: account.accountNumber,
      balance: account.balance,
    }));
  });

  it('DELETE /accounts/:accountNumber - should delete an account', async () => {
    const account = await accountRepository.save({ accountNumber: 123456, balance: 100 });

    await request(app.getHttpServer())
      .delete(`/accounts/${account.accountNumber}`)
      .expect(204);

    const deletedAccount = await accountRepository.findOne({ where: { accountNumber: account.accountNumber } });
    expect(deletedAccount).toBeNull(); 
  });

  it('GET /accounts/:accountNumber - should return 404 for non-existing account', async () => {
    const response = await request(app.getHttpServer())
      .get('/accounts/12')
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('message', 'Conta de número 12 não encontrada');
  });
});
