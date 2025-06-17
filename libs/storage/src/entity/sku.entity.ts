import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/storage/entity/base.entity';
import { ProductEntity } from '@app/storage/entity/product.entity';

@Entity('sku')
@Index(['productId', 'expirationDate'], { unique: true })
export class SkuEntity extends BaseEntity {
  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
