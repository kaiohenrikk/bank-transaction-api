import { IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { TransactionType } from '../enums/transaction-type.enum';

export class TransactionDto {
  @IsOptional()
  @IsNumber()
  destino?: number;

  @IsNotEmpty()
  @IsNumber()
  origem: number;

  @IsNotEmpty()
  @IsNumber()
  valor: number;

  @IsEnum(TransactionType, { message: 'tipo must be one of the following: deposito, saque, transferencia' })
  tipo: TransactionType;
}
