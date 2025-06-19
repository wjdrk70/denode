import { SkuEntity } from '@app/storage/entity/sku.entity';
import { Sku } from '@app/inventory/domain/sku';
import { ProductMapper } from '@app/storage/mapper/product.mapper';
import { ProductEntity } from '@app/storage/entity/product.entity';

export class SkuMapper {
  static toDomain(entity: SkuEntity): Sku {
    return new Sku({
      id: entity.id,
      productId: entity.product.id,
      quantity: entity.quantity,
      expirationDate: entity.expirationDate,
      product: entity.product ? ProductMapper.toDomain(entity.product) : undefined,
    });
  }

  static toEntity(domain: Sku): SkuEntity {
    const entity = new SkuEntity();
    entity.id = domain.id;
    entity.quantity = domain.quantity;
    entity.expirationDate = domain.expirationDate ?? null;
    if (domain.productId) {
      entity.product = { id: domain.productId } as ProductEntity;
    }
    return entity;
  }
}
