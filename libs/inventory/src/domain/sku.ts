import { InvalidStockQuantityError } from '@app/inventory/support/exception/invalid-stock-quantity.error';
import { InsufficientStockError } from '@app/inventory/support/exception/insufficient-stock.error';

export class Sku {
  readonly id: number;
  readonly productId: number;
  quantity: number;
  readonly expirationDate?: Date;

  constructor(args: { id?: number; productId: number; quantity: number; expirationDate?: Date }) {
    this.id = args.id;
    this.productId = args.productId;
    this.quantity = args.quantity;
    this.expirationDate = args.expirationDate;
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('수량은 1 이상 이어야 합니다.');
    }
    this.quantity += quantity;
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidStockQuantityError();
    }

    if (this.quantity < quantity) {
      throw new InsufficientStockError();
    }
    this.quantity -= quantity;
  }

  static create(args: { productId: number; quantity: number; expirationDate?: Date }): Sku {
    return new Sku(args);
  }
}
