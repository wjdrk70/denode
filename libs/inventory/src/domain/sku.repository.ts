import { Sku } from '@app/inventory/domain/sku';

export const SKU_REPOSITORY = Symbol.for('SKU_REPOSITORY');

export interface SkuRepository {
  findById(id: number): Promise<Sku | null>;

  findByProductId(productId: number): Promise<Sku[]>;

  findByProductIdAndExpirationDate(productId: number, expirationDate?: Date): Promise<Sku | null>;

  findForUpdate(productId: number, expirationDate?: Date): Promise<Sku | null>;

  findForUpdateByProductId(productId: number): Promise<Sku[]>;

  findAndCount(option: { offset: number; limit: number }): Promise<[Sku[], number]>;

  save(item: Sku): Promise<Sku>;
}
