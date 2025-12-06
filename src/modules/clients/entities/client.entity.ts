import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column()
  district: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', nullable: true })
  first_purchase: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_purchase: Date;

  @Column({ default: true })
  marketing_opt_in: boolean;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /** Relations */
  @OneToMany(() => Order, (o) => o.client)
  orders: Order[];
}
