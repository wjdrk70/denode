import { StockHistoryType } from '@app/inventory/domain/stock-history.type';

export class StockHistory {
  readonly id: number;
  readonly skuId: number;
  readonly type: StockHistoryType;
  readonly quantity: number;

  constructor(args: { id?: number; skuId: number; type: StockHistoryType; quantity: number }) {
    this.id = args.id;
    this.skuId = args.skuId;
    this.type = args.type;
    this.quantity = args.quantity;
  }
}
