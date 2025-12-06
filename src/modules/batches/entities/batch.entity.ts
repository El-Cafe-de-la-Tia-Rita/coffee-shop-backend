import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { MicroBatch } from '../../micro-batches/entities/micro-batch.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { InventoryMovement } from '../../inventory/entities/inventory-movement.entity';
import { BatchStatus } from '../../../common/enums/batch-status.enum';

@Entity('batch')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'date' })
  purchase_date: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  green_kg: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  green_kg_available: number;

  @Column()
  producer: string;

  @Column()
  origin: string;

  @Column()
  variety: string;

  @Column()
  process: string;

  @Column()
  altitude_masl: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  cost_per_kg: number;

  @Column({ type: 'enum', enum: BatchStatus })
  status: BatchStatus;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  /** Relations */
  @OneToMany(() => MicroBatch, (m) => m.batch)
  microbatches: MicroBatch[];

  @OneToMany(() => Expense, (e) => e.batch)
  expenses: Expense[];

  @OneToMany(() => InventoryMovement, (m) => m.batch)
  inventory_movements: InventoryMovement[];
}
