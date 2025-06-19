import { InvalidStockQuantityException } from '@app/inventory/support/exception/invalid-stock-quantity.exception';
import { InsufficientStockException } from '@app/inventory/support/exception/insufficient-stock.exception';
import { Product } from '@app/product/domain/product';

export class Sku {
  readonly id: number;
  readonly productId: number;
  quantity: number;
  readonly product?: Product;
  readonly expirationDate?: Date;

  constructor(args: { id?: number; productId: number; quantity: number; expirationDate?: Date; product?: Product }) {
    this.id = args.id;
    this.productId = args.productId;
    this.quantity = args.quantity;
    this.expirationDate = args.expirationDate;
    this.product = args.product;
  }

  increaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidStockQuantityException();
    }
    this.quantity += quantity;
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new InvalidStockQuantityException();
    }

    if (this.quantity < quantity) {
      throw new InsufficientStockException();
    }
    this.quantity -= quantity;
  }

  static create(args: { productId: number; quantity: number; expirationDate?: Date }): Sku {
    return new Sku(args);
  }

  static createEmpty(args: { productId: number; expirationDate?: Date }): Sku {
    return new Sku({
      ...args,
      quantity: 0,
    });
  }
}
