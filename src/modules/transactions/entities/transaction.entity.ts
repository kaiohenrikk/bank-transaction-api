import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { v4 as uuidv4 } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';

@Entity('transactions')
export class Transaction {
  @ApiProperty({
    description: 'Identificador único da transação',
    example: uuidv4(),
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'accountNumber', referencedColumnName: 'accountNumber' })
  account: Account;

  @ApiProperty({
    description: 'Quantidade envolvida na transação',
    example: 100,
  })
  @Column({ type: 'int' })
  amount: number;

  @ApiProperty({
    description: 'Tipo de transação (ex: deposito, saque, transferencia)',
    enum: TransactionType,
    example: 'deposito',
  })
  @Column({ type: 'varchar', length: 20 })
  type: TransactionType;

  @ApiProperty({
    description: 'Timestamp de quando a transação foi realizada',
    example: new Date().toISOString(),
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
