import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../../../src/modules/transactions/entities/transaction.entity';
import { Account } from '../../../../src/modules/accounts/entities/accounts.entity';
import { TransactionType } from '../../../../src/modules/transactions/enums/transaction-type.enum';
import { AppModule } from '../../../../src/app.module';
import { TransactionDto } from '../../../../src/modules/transactions/dto/transaction.dto';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let transactionRepository: Repository<Transaction>;
  let accountRepository: Repository<Account>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    transactionRepository = moduleFixture.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    accountRepository = moduleFixture.get<Repository<Account>>(getRepositoryToken(Account));

    await accountRepository.save({ accountNumber: 12345, balance: 1000 });
    await accountRepository.save({ accountNumber: 54321, balance: 2000 });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await transactionRepository.clear();
  });

  describe('POST /transactions', () => {
    it('should create a deposit transaction', async () => {
      const transactionDto = {
        origem: 12345,
        valor: 1000,
        tipo: TransactionType.DEPOSIT,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(transactionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        origem: transactionDto.origem,
        valor: transactionDto.valor,
        tipo: transactionDto.tipo,
      });
    });

    it('should create a withdrawal transaction', async () => {
      const transactionDto = {
        origem: 12345,
        valor: 500,
        tipo: TransactionType.WITHDRAWAL,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(transactionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        origem: transactionDto.origem,
        valor: transactionDto.valor,
        tipo: transactionDto.tipo,
      });
    });

    it('should create a transfer transaction', async () => {
      const transactionDto = {
        origem: 12345,
        destino: 54321,
        valor: 300,
        tipo: TransactionType.TRANSFER,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(transactionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        origem: transactionDto.origem,
        destino: transactionDto.destino,
        valor: transactionDto.valor,
        tipo: transactionDto.tipo,
      });
    });
  });

  describe('Error handling', () => {
    it('should return 422 for non-existing account during transfer', async () => {
      const transactionDto: TransactionDto = {
        origem: 99999, 
        destino: 54321,
        valor: 100,
        tipo: TransactionType.TRANSFER,
      };

      const response = await request(app.getHttpServer())
        .post('/transactions')
        .send(transactionDto)
        .expect(422);

      expect(response.body).toHaveProperty('statusCode', 422);
      expect(response.body).toHaveProperty('message', 'Conta de origem ou de destino não encontrada. Origem: 99999. Destino: 54321.');
    });
  });
});
