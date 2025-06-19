import { StockHistory } from '@app/inventory/domain/stock-history';

export const STOCK_HISTORY_REPOSITORY = Symbol.for('STOCK_HISTORY_REPOSITORY');

export interface StockHistoryRepository {
  save(history: StockHistory): Promise<StockHistory>;

  findBySkuId(skuId: number): Promise<StockHistory[]>;

  findAndCountBySkuId(skuId: number, option: { offset: number; limit: number }): Promise<[StockHistory[], number]>;

  findAndCountBySkuIds(skuIds: number[], option: { offset: number; limit: number }): Promise<[StockHistory[], number]>;
}
