import { StockHistory } from '@app/inventory/domain/stock-history';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';

export class StockHistoryMapper {
  static toDomain(entity: StockHistoryEntity): StockHistory {
    return new StockHistory({
      id: entity.id,
      skuId: entity.skuId,
      type: entity.type,
      quantity: entity.quantity,
    });
  }

  static toEntity(domain: StockHistory): StockHistoryEntity {
    const entity = new StockHistoryEntity();
    entity.id = domain.id;
    entity.skuId = domain.skuId;
    entity.type = domain.type;
    entity.quantity = domain.quantity;

    return entity;
  }
}
