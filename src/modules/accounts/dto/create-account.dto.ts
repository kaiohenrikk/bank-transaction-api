import { IsNotEmpty, IsString, IsDecimal } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsNotEmpty() 
  @IsDecimal({ decimal_digits: '2', force_decimal: true })
  balance: string; 
}
