import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb')
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    name: string;
  }>;

  @Column('decimal')
  subtotal: number;

  @Column('decimal')
  discount: number;

  @Column('decimal')
  total: number;

  @Column()
  paymentMethod: 'cash' | 'card' | 'mpesa' | 'emola' | 'transfer';

  @Column('decimal')
  amountPaid: number;

  @Column('decimal')
  change: number;

  @Column('boolean', { default: false })
  isOffline: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
