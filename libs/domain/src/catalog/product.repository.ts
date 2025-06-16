import { Product } from '@app/domain/catalog/product';

export const PRODUCT_REPOSITORY = Symbol.for('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findByName(name: string): Promise<Product | null>;

  save(product: Product): Promise<Product>;
}
