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
import { Batch } from '../../batches/entities/batch.entity';
import { Product } from '../../products/entities/product.entity';
import { RoastType } from '@common/enums/roast-type.enum';

@Entity('microbatches')
export class MicroBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Batch, (l) => l.microbatches)
  batch: Batch;

  @Column({ unique: true })
  code: string;

  @Column()
  roast_number: number;

  @Column({ type: 'date' })
  roast_date: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  green_kg_used: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  roasted_kg_obtained: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  loss_kg: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  loss_percentage: number;

  @Column({ type: 'enum', enum: RoastType })
  roast_type: RoastType;

  @Column()
  roast_responsible: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  /** Relations */
  @OneToMany(() => Product, (p) => p.microbatch)
  product_stock: Product[];
}
