import { ProductEntity } from '@app/storage/entity/product.entity';
import { Product } from '@app/product/domain/product';

export class ProductMapper {
  static toDomain(entity: ProductEntity): Product {
    return new Product({
      id: entity.id,
      name: entity.name,
      description: entity.description,
    });
  }

  static toEntity(domain: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    return entity;
  }
}
