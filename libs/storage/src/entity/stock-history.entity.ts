import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';

@Entity('stock_history')
export class StockHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sku_id' })
  skuId: number;

  @Column({ type: 'enum', enum: StockHistoryType })
  type: StockHistoryType;

  @Column({ name: 'quantity', type: 'int', unsigned: true })
  quantity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => SkuEntity)
  @JoinColumn({ name: 'sku_id' })
  sku: SkuEntity;
}
