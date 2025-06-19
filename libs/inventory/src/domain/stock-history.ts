import { StockHistoryType } from '@app/inventory/domain/stock-history.type';

export class StockHistory {
  readonly id: number;
  readonly skuId: number;
  readonly userId: number;
  readonly type: StockHistoryType;
  readonly quantity: number;

  constructor(args: { id?: number; skuId: number; userId: number; type: StockHistoryType; quantity: number }) {
    this.id = args.id;
    this.skuId = args.skuId;
    this.userId = args.userId;
    this.type = args.type;
    this.quantity = args.quantity;
  }

  static create(args: { skuId: number; userId: number; type: StockHistoryType; quantity: number }): StockHistory {
    return new StockHistory(args);
  }
}
