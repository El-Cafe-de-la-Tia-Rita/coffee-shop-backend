import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Batch } from '../../batches/entities/batch.entity';
import { User } from '../../users/entities/user.entity';
import { MovementType } from '../../../common/enums/movement-type.enum';

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.inventory_movements)
  product_stock: Product;

  @ManyToOne(() => Batch, (l) => l.inventory_movements, { nullable: true })
  batch: Batch;

  @Column({ type: 'enum', enum: MovementType })
  movement_type: MovementType;

  @Column()
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ nullable: true })
  reference: string;

  @ManyToOne(() => User, (u) => u.inventory_movements)
  user: User;

  @Column({ type: 'timestamp' })
  movement_date: Date;

  @CreateDateColumn()
  created_at: Date;
}
