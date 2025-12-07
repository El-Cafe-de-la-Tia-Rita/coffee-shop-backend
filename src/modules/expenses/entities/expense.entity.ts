import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';
import { ExpenseCategory } from '@common/enums/expense-category.enum';
import { PaymentMethod } from '@common/enums/payment-method.enum';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Batch, (l) => l.expenses, { nullable: true })
  batch?: Batch;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column()
  concept: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  provider: string;

  @Column()
  receipt_url: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column()
  responsible: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
