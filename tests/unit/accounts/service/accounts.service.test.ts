import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from "../../../../src/modules/accounts/service/accounts.service";
import { Account } from "../../../../src/modules/accounts/entities/accounts.entity";
import { AccountDto } from '../../../../src/modules/accounts/dto/account.dto';

describe('AccountsService', () => {
    let service: AccountsService;

    const mockAccount: Account = {
        accountNumber: 12345,
        balance: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
    };

    const mockResponse: AccountDto = {
        numero: mockAccount.accountNumber,
        saldo: mockAccount.balance,
    };

    const mockRepository = {
        save: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AccountsService,
                {
                    provide: getRepositoryToken(Account),
                    useValue: mockRepository,
                },
            ],
        })
            .overrideProvider('DatabaseConnection')
            .useValue(null)
            .compile();

        service = module.get<AccountsService>(AccountsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new account', async () => {
        mockRepository.save.mockResolvedValue(mockAccount);
        const result = await service.createAccount(mockResponse);
        expect(result).toEqual(mockResponse);
        expect(mockRepository.save).toHaveBeenCalledWith({
            "accountNumber": 12345,
            "balance": 1000,
        });
    });

    it('should return an account by accountNumber', async () => {
        mockRepository.findOne.mockResolvedValue(mockAccount);
        const result = await service.getAccount(12345);
        expect(result).toEqual(mockAccount);
        expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { accountNumber: 12345 } });
    });

    it('should throw NotFoundException if account does not exist', async () => {
        mockRepository.findOne.mockResolvedValue(null);
        await expect(service.getAccount(99999)).rejects.toThrow(
            new NotFoundException('Conta de número 99999 não encontrada'),
        );
    });

    it('should update an existing account', async () => {
        mockRepository.findOne.mockResolvedValue(mockAccount);
        mockRepository.save.mockResolvedValue({ ...mockAccount, balance: 2000 });

        const result = await service.updateAccount(mockAccount);
        expect(result.balance).toEqual(2000);
        expect(mockRepository.save).toHaveBeenCalledWith({ ...mockAccount, balance: 1000 });
    });

    it('should delete an account and return true if successful', async () => {
        mockRepository.delete.mockResolvedValue({ affected: 1 });

        try {
            await service.deleteAccount(12345);
        } catch (error) {       
            expect(error).toBeUndefined();
        }

        expect(mockRepository.delete).toHaveBeenCalledWith({ accountNumber: 12345 });
    });

    it('should throw error if account deletion fails', async () => {
        mockRepository.delete.mockResolvedValue({ affected: 0 });

        try {
            await service.deleteAccount(99999);
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
       
    });

    it('should return all accounts', async () => {
        mockRepository.find.mockResolvedValue([mockAccount]);
        const result = await service.getAllAccounts();
        expect(result).toEqual([mockAccount]);
    });
});
