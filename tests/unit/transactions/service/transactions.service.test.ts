import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionsService } from "../../../../src/modules/transactions/service/transactions.service";
import { AccountsService } from "../../../../src/modules/accounts/service/accounts.service";
import { Account } from "../../../../src/modules/accounts/entities/accounts.entity";
import { Transaction } from "../../../../src/modules/transactions/entities/transaction.entity";
import { TransactionType } from '../../../../src/modules/transactions/enums/transaction-type.enum';
import { DataSource } from 'typeorm';

describe('TransactionsService', () => {
    let service: TransactionsService;

    const mockDataSource = {
        transaction: jest.fn().mockImplementation(async (_mode, callback) => {
            return await callback({
                findOne: jest.fn().mockImplementation(async (_entity, options) => {
                    if (options.where.accountNumber === 12345) {
                        return {
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            accountNumber: 12345,
                            balance: 5000,
                            version: 1,
                        }
                    }

                    return {
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        accountNumber: 54321,
                        balance: 2000,
                        version: 1,
                    }

                }),
                save: jest.fn().mockImplementation(async (account) => account),
            });
        }),
        createQueryBuilder: jest.fn(),
    };

    const mockAccount: Account = {
        accountNumber: 12345,
        balance: 5000,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
    };

    const mockTransaction: Transaction = {
        id: "1",
        account: mockAccount,
        type: TransactionType.DEPOSIT,
        amount: 1000,
        createdAt: new Date()
    };

    const mockRepository = {
        find: jest.fn(),
        save: jest.fn(),
    };

    const mockAccountsService = {
        getAccount: jest.fn(),
        updateAccount: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                {
                    provide: AccountsService,
                    useValue: mockAccountsService,
                },
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: mockRepository,
                },
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                }
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTransaction', () => {
        it('should create a deposit transaction successfully', async () => {
            mockAccountsService.getAccount.mockResolvedValue(mockAccount);
            mockAccountsService.updateAccount.mockResolvedValue(mockAccount);

            const result = await service.createTransaction({
                origem: 12345,
                valor: 1000,
                tipo: TransactionType.DEPOSIT,
            });

            expect(result).toEqual({
                "destino": undefined,
                "origem": 12345,
                "tipo": "deposito",
                "valor": 1000,
            });
            expect(mockAccountsService.updateAccount).toHaveBeenCalledWith({
                ...mockAccount,
                balance: 6000,
            });
        });

        it('should throw UnprocessableEntityException when balance is insufficient for withdrawal', async () => {
            mockAccountsService.getAccount.mockResolvedValue(mockAccount);

            const promise = service.createTransaction({
                origem: 12345,
                valor: 6000,
                tipo: TransactionType.WITHDRAWAL,
            });

            return promise.catch((e) => {
                expect(e).toBeInstanceOf(UnprocessableEntityException);
                expect(mockAccountsService.getAccount).toHaveBeenCalledWith(12345);
            });
        });

        it('should throw BadRequestException if destination is missing for transfer', () => {
            const promise = service.createTransaction({
                origem: 12345,
                valor: 1000,
                tipo: TransactionType.TRANSFER,
            });

            return promise.catch((e) => {
                expect(e).toBeInstanceOf(BadRequestException);
            });
        });

        it('should transfer funds successfully between accounts', async () => {

            const origemAccount: Account = {
                ...mockAccount,
                balance: 5000,
            };

            const destinationAccount: Account = {
                createdAt: new Date(),
                updatedAt: new Date(),
                accountNumber: 54321,
                balance: 2000,
                version: 1
            };

            mockAccountsService.getAccount
                .mockResolvedValueOnce(origemAccount)
                .mockResolvedValueOnce(destinationAccount);

            mockAccountsService.updateAccount
                .mockResolvedValueOnce({ ...origemAccount, balance: 4000 })
                .mockResolvedValueOnce({ ...destinationAccount, balance: 3000 });

            const result = await service.createTransaction({
                origem: 12345,
                destino: 54321,
                valor: 1000,
                tipo: TransactionType.TRANSFER,
            });

            expect(result).toEqual({
                origem: 12345,
                destino: 54321,
                valor: 1000,
                tipo: TransactionType.TRANSFER,
            });
        });

    });

    describe('getAllTransactionsByAccountNumber', () => {
        it('should return all transactions for an account', async () => {
            mockAccountsService.getAccount.mockResolvedValue(mockAccount);
            mockRepository.find.mockResolvedValue([mockTransaction]);

            const result = await service.getAllTransactionsByAccountNumber(12345);

            expect(result).toEqual([mockTransaction]);
            expect(mockRepository.find).toHaveBeenCalled();
        });

        it('should throw NotFoundException if no transactions found', async () => {
            mockAccountsService.getAccount.mockResolvedValue(mockAccount);
            mockRepository.find.mockResolvedValue([]);

            const promise = service.getAllTransactionsByAccountNumber(12345);
            return promise.catch((e) => {
                expect(e).toBeInstanceOf(NotFoundException);
            });
        });
    });

    describe('getTransactionsByAccountNumberAndTransactionType', () => {
        it('should return transactions of a specific type for an account', async () => {
            mockAccountsService.getAccount.mockResolvedValue(mockAccount);
            mockRepository.find.mockResolvedValue([mockTransaction]);

            const result = await service.getTransactionsByAccountNumberAndTransactionType(
                12345,
                TransactionType.DEPOSIT,
            );

            expect(result).toEqual([mockTransaction]);
            expect(mockRepository.find).toHaveBeenCalled();
        });

        it('should throw NotFoundException if no transactions of the specified type found', async () => {
            mockAccountsService.getAccount.mockResolvedValue(mockAccount);
            mockRepository.find.mockResolvedValue([]);

            const promise = service.getTransactionsByAccountNumberAndTransactionType(12345, TransactionType.WITHDRAWAL);
            return promise.catch((e) => {
                expect(e).toBeInstanceOf(NotFoundException);
            });
        });
    });
});
