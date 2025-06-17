import { Product } from '@app/product/domain/product';

export const PRODUCT_REPOSITORY = Symbol.for('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findById(productId: number): Promise<Product | null>;

  findByName(name: string): Promise<Product | null>;

  save(product: Product): Promise<Product>;
}
