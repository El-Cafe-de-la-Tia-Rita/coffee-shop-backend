import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_catalog')
export class ProductCatalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  weight_grams: number;

  @Column()
  package_type: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) // Added base_price
  base_price: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  /** Relations */
  @OneToMany(() => Product, (p) => p.product_catalog)
  product_stock: Product[];
}
