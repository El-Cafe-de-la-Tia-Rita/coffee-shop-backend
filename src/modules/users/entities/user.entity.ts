import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventoryMovement } from '../../inventory/entities/inventory-movement.entity';
import { Order } from '../../orders/entities/order.entity';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /** Relations */
  @OneToMany(() => Order, (o) => o.created_by)
  orders: Order[];

  @OneToMany(() => InventoryMovement, (m) => m.user)
  inventory_movements: InventoryMovement[];
}
