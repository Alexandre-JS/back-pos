import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { generateBarcode } from '../utils/barcode.generator';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  salePrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  minStock: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  promotionalPrice: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  expirationDate: Date;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  categoryRef: Category;

  @Column({ nullable: true })
  categoryId: number;

  @BeforeInsert()
  async generateBarcodeIfEmpty() {
    if (!this.barcode) {
      this.barcode = await generateBarcode();
    }
  }
}
