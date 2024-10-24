import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '../../accounts/entities/accounts.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { v4 as uuidv4 } from 'uuid';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string; 

  @ManyToOne(() => Account, { nullable: false })
  @JoinColumn({ name: 'accountNumber', referencedColumnName: 'accountNumber' })
  account: Account; 

  @Column({ type: 'int' })
  amount: number; 

  @Column({ type: 'varchar', length: 20 })
  type: TransactionType; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; 
}
