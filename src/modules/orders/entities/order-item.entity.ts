import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (o) => o.items)
  order: Order;

  @ManyToOne(() => Product, (p) => p.order_items)
  product_stock: Product;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  sold_kg: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
