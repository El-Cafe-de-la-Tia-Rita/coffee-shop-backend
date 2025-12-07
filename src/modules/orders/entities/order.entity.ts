import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';
import { OrderOrigin } from '../../../common/enums/order-origin.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_number: string;

  @ManyToOne(() => Client, (c) => c.orders)
  client: Client;

  @Column({ type: 'timestamp' })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  delivery_date_estimated: string | null;

  @Column({ type: 'date', nullable: true })
  delivery_date_real: string | null;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  shipping: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ default: false })
  payment_confirmed: boolean;

  @Column({ nullable: true })
  payment_receipt_url: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text' })
  delivery_address: string;

  @Column({ type: 'enum', enum: OrderOrigin })
  origin: OrderOrigin;

  @ManyToOne(() => User, (u) => u.orders)
  created_by: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  /** Relations */
  @OneToMany(() => OrderItem, (i) => i.order)
  items: OrderItem[];
}