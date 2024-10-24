import { IsNotEmpty, IsNumber } from 'class-validator';

export class AccountDto {
  @IsNotEmpty()
  @IsNumber()
  numero: number;

  @IsNotEmpty() 
  @IsNumber()
  saldo: number; 
}
