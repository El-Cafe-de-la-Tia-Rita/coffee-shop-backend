import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
} from 'typeorm';
import { ProductCatalog } from './product-catalog.entity';
import { MicroBatch } from '../../micro-batches/entities/micro-batch.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { InventoryMovement } from '../../inventory/entities/inventory-movement.entity';
import { GrindType } from '@common/enums/grind-type.enum';

@Entity('product_stock')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductCatalog, (c) => c.product_stock)
  product_catalog: ProductCatalog;

  @ManyToOne(() => MicroBatch, (m) => m.product_stock)
  microbatch: MicroBatch;

  @Column({ unique: true })
  sku: string;

  @Column({ type: 'enum', enum: GrindType })
  grind_type: GrindType;

  @Column()
  stock_current: number;

  @Column()
  stock_reserved: number;

  @Column()
  stock_minimum: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  sale_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_cost: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @BeforeInsert()
  generateSku() {
    this.sku = `${this.microbatch.code}-${this.grind_type}-${this.product_catalog.code}`;
  }

  /** Relations */
  @OneToMany(() => OrderItem, (i) => i.product_stock)
  order_items: OrderItem[];

  @OneToMany(() => InventoryMovement, (i) => i.product_stock)
  inventory_movements: InventoryMovement[];
}
