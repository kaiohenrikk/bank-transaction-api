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
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await accountRepository.save({ accountNumber: 12345, balance: 1000 });
        await accountRepository.save({ accountNumber: 54321, balance: 2000 });
    });

    afterEach(async () => {
        await transactionRepository.clear();
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

    describe('Concurrency Scenarios', () => {
        it('should handle concurrent deposits and withdrawals correctly', async () => {

            const depositPromise = request(app.getHttpServer())
                .post('/transactions')
                .send({ origem: 12345, valor: 50, tipo: TransactionType.DEPOSIT });

            const withdrawalPromise = request(app.getHttpServer())
                .post('/transactions')
                .send({ origem: 12345, valor: 30, tipo: TransactionType.WITHDRAWAL });

            await Promise.all([depositPromise, withdrawalPromise]);

            const account = await request(app.getHttpServer())
                .get('/accounts/12345')
                .expect(200);

            expect(account.body.balance).toBe(1020);
        });

        it('should handle concurrent deposit and transfer correctly', async () => {

            await accountRepository.save({ accountNumber: 101, balance: 100 });
            await accountRepository.save({ accountNumber: 202, balance: 100 });

            await Promise.all([
                request(app.getHttpServer())
                    .post('/transactions')
                    .send({ origem: 101, valor: 100, tipo: TransactionType.DEPOSIT })
                    .expect(201),

                request(app.getHttpServer())
                    .post('/transactions')
                    .send({ origem: 101, destino: 202, valor: 50, tipo: TransactionType.TRANSFER })
                    .expect(201),
            ]);

            const account123 = await request(app.getHttpServer())
                .get('/accounts/101')
                .expect(200);

            const account456 = await request(app.getHttpServer())
                .get('/accounts/202')
                .expect(200);

            expect(account123.body.balance).toBe(150);
            expect(account456.body.balance).toBe(150);
        });

        it('should handle concurrent transfers between accounts correctly', async () => {
            await Promise.all([
                accountRepository.save({ accountNumber: 123, balance: 20 }),
                accountRepository.save({ accountNumber: 456, balance: 10 }),
                accountRepository.save({ accountNumber: 789, balance: 10 })
            ])

            await Promise.all([
                request(app.getHttpServer())
                    .post('/transactions')
                    .send({ origem: 123, destino: 456, valor: 20, tipo: TransactionType.TRANSFER })
                    .expect(201),

                request(app.getHttpServer())
                    .post('/transactions')
                    .send({ origem: 456, destino: 789, valor: 10, tipo: TransactionType.TRANSFER })
                    .expect(201),
            ]);

            const account123 = await request(app.getHttpServer())
                .get('/accounts/123')
                .expect(200);

            const account456 = await request(app.getHttpServer())
                .get('/accounts/456')
                .expect(200);

            const account789 = await request(app.getHttpServer())
                .get('/accounts/789')
                .expect(200);

            expect(account123.body.balance).toBe(0);
            expect(account456.body.balance).toBe(20);
            expect(account789.body.balance).toBe(20);
        });
    })

});
