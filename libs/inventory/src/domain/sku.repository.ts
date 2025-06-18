import { Sku } from '@app/inventory/domain/sku';

export const SKU_REPOSITORY = Symbol.for('SKU_REPOSITORY');

export interface SkuRepository {
  findByProductIdAndExpirationDate(productId: number, expirationDate?: Date): Promise<Sku | null>;

  save(item: Sku): Promise<Sku>;
}
