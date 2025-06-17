import { Injectable } from '@nestjs/common';
import { SkuRepository } from '@app/inventory/domain/sku.repository';
import { Sku } from '@app/inventory/domain/sku';
import { InjectRepository } from '@nestjs/typeorm';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { Repository } from 'typeorm';
import { TransactionContextManager } from '@app/storage/transaction/transaction-context-manager';
import { SkuMapper } from '@app/storage/mapper/sku.mapper';

@Injectable()
export class SkuOrmRepository implements SkuRepository {
  constructor(
    @InjectRepository(SkuEntity)
    private readonly skuRepository: Repository<SkuEntity>,
    private readonly contextManager: TransactionContextManager,
  ) {}

  async findByProductIdAndExpirationDate(productId: number, expirationDate?: Date): Promise<Sku | null> {
    const repository = this.getRepository();

    const entity = await repository.findOneBy({ productId: productId, expirationDate: expirationDate || null });

    return entity ? SkuMapper.toDomain(entity) : null;
  }

  async save(item: Sku): Promise<Sku> {
    const repository = this.getRepository();

    const entity = SkuMapper.toEntity(item);
    const saveEntity = await repository.save(entity);
    return SkuMapper.toDomain(saveEntity);
  }

  private getRepository(): Repository<SkuEntity> {
    const entityManager = this.contextManager.getCurrentEntityManager();

    if (entityManager) {
      return entityManager.getRepository(SkuEntity);
    }

    return this.skuRepository;
  }
}
