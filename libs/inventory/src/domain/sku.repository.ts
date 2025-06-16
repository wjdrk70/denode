import { Sku } from '@app/inventory/domain/sku';
import { StockHistory } from '@app/inventory/domain/stock-history';

export const SkU_REPOSITORY = Symbol.for('SkU_REPOSITORY');

export interface SkuRepository {
  findByProductIdAndExpirationDate(productId: number, expirationDate?: Date): Promise<Sku | null>;

  save(item: Sku): Promise<Sku>;
}
