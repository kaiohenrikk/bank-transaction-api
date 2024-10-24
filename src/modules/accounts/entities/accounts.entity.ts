import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'int', unique: true })
  accountNumber: number;

  @Column({ type: 'int', default: 0 })
  balance: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}