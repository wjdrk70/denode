import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/storage/entity/base.entity';
import { SkuEntity } from '@app/storage/entity/sku.entity';

@Entity('product')
export class ProductEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => SkuEntity, (sku) => sku.product)
  skus: SkuEntity[];
}
