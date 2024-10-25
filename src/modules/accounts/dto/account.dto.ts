import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccountDto {
  @ApiProperty({
    description: 'Número da conta',
    example: 123456,
  })
  @IsNotEmpty()
  @IsNumber()
  numero: number;

  @ApiProperty({
    description: 'Saldo da conta',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  saldo: number;
}
