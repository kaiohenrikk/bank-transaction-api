import { Entity, Column, PrimaryColumn, VersionColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('accounts')
export class Account {
  @ApiProperty({
    description: 'Número da conta. Identificador único.',
    example: 123456,
  })
  @PrimaryColumn({ type: 'int', unique: true })
  accountNumber: number;

  @ApiProperty({ description: 'Saldo da conta', example: 1000 })
  @Column({ type: 'int', default: 0 })
  balance: number;

  @ApiProperty({ description: 'Data de criação', example: new Date() })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização', example: new Date() })
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
