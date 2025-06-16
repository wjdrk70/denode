import { StockHistory } from '@app/inventory/domain/stock-history';

export const STOCK_HISTORY_REPOSITORY = Symbol.for('STOCK_HISTORY_REPOSITORY');

export interface StockHistoryRepository {
  save(history: StockHistory): Promise<StockHistory>;
}
