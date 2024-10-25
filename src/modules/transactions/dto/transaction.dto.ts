import { IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enums/transaction-type.enum';

export class TransactionDto {
  @ApiProperty({
    description:
      'A conta destino que receberá o valor da transferência. Só é obrigatório quando o tipo de transação for transferência.',
    example: 654321,
  })
  @IsOptional()
  @IsNumber()
  destino?: number;

  @ApiProperty({
    description: 'Número da conta origem',
    example: 123456,
  })
  @IsNotEmpty()
  @IsNumber()
  origem: number;

  @ApiProperty({
    description: 'Quantidade que será transferida',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  valor: number;

  @ApiProperty({
    description: 'The type of transaction',
    enum: TransactionType,
    example: 'deposito',
  })
  @IsEnum(TransactionType, {
    message:
      'tipo must be one of the following: deposito, saque, transferencia',
  })
  tipo: TransactionType;
}
