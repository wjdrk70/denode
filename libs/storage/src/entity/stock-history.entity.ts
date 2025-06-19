import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { UserEntity } from '@app/storage/entity/user.entity';

@Entity('stock_history')
export class StockHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sku_id' })
  skuId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'enum', enum: StockHistoryType })
  type: StockHistoryType;

  @Column({ name: 'quantity', type: 'int', unsigned: true })
  quantity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => SkuEntity)
  @JoinColumn({ name: 'sku_id' })
  sku: SkuEntity;

  @ManyToOne(() => UserEntity) // User와의 관계 추가
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
