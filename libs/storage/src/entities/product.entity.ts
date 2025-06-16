import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '@app/storage/entities/base.entity';

@Entity('product')
export class ProductEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
