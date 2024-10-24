import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryColumn({ unique: true })
  accountNumber: number;

  @Column({ type: 'decimal', default: 0 })
  balance: number;
}