import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '@app/storage/entity/base.entity';
import { ProductEntity } from '@app/storage/entity/product.entity';

@Entity('sku')
@Index(['product', 'expirationDate'], { unique: true })
export class SkuEntity extends BaseEntity {
  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate?: Date;

  @ManyToOne(() => ProductEntity, (product) => product.skus)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
