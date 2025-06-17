import { SkuEntity } from '@app/storage/entity/sku.entity';
import { Sku } from '@app/inventory/domain/sku';

export class SkuMapper {
  static toDomain(entity: SkuEntity): Sku {
    return new Sku({
      id: entity.id,
      productId: entity.productId,
      quantity: entity.quantity,
      expirationDate: entity.expirationDate,
    });
  }

  static toEntity(domain: Sku): SkuEntity {
    const entity = new SkuEntity();
    entity.id = domain.id;
    entity.productId = domain.productId;
    entity.quantity = domain.quantity;
    entity.expirationDate = domain.expirationDate;
    return entity;
  }
}
