import { Injectable } from '@nestjs/common';
import { StockHistoryRepository } from '@app/inventory/domain/stock-history.repository';
import { StockHistory } from '@app/inventory/domain/stock-history';
import { InjectRepository } from '@nestjs/typeorm';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';
import { Repository } from 'typeorm';
import { TransactionContextManager } from '@app/storage/transaction/transaction-context-manager';
import { StockHistoryMapper } from '@app/storage/mapper/stock-history.mapper';

@Injectable()
export class StockHistoryOrmRepository implements StockHistoryRepository {
  constructor(
    @InjectRepository(StockHistoryEntity)
    private readonly stockHistoryRepository: Repository<StockHistoryEntity>,
    private readonly contextManager: TransactionContextManager,
  ) {}

  async save(item: StockHistory): Promise<StockHistory> {
    const repository = this.getRepository();
    const entity = StockHistoryMapper.toEntity(item);
    const saved = await repository.save(entity);
    return StockHistoryMapper.toDomain(saved);
  }

  async findBySkuId(skuId: number): Promise<StockHistory[]> {
    const repository = this.getRepository();
    const entities = await repository.find({
      where: { skuId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => StockHistoryMapper.toDomain(entity));
  }

  private getRepository(): Repository<StockHistoryEntity> {
    const entityManager = this.contextManager.getCurrentEntityManager();

    if (entityManager) {
      return entityManager.getRepository(StockHistoryEntity);
    }

    return this.stockHistoryRepository;
  }
}
