import { Injectable } from '@nestjs/common';
import { SkuRepository } from '@app/inventory/domain/sku.repository';
import { Sku } from '@app/inventory/domain/sku';
import { InjectRepository } from '@nestjs/typeorm';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { IsNull, Repository } from 'typeorm';
import { TransactionContextManager } from '@app/storage/transaction/transaction-context-manager';
import { SkuMapper } from '@app/storage/mapper/sku.mapper';

@Injectable()
export class SkuOrmRepository implements SkuRepository {
  constructor(
    @InjectRepository(SkuEntity)
    private readonly skuRepository: Repository<SkuEntity>,
    private readonly contextManager: TransactionContextManager,
  ) {}

  async findById(id: number): Promise<Sku | null> {
    const entity = await this.getRepository().findOneBy({ id });
    return entity ? SkuMapper.toDomain(entity) : null;
  }

  async findAndCount(option: { offset: number; limit: number }): Promise<[Sku[], number]> {
    const repository = this.getRepository();
    const queryBuilder = repository.createQueryBuilder('sku');

    const [entities, total] = await queryBuilder
      .orderBy('sku.expirationDate IS NULL', 'DESC') // 1. NULL인 값을 맨 앞으로
      .addOrderBy('sku.expirationDate', 'DESC') // 2. NULL이 아닌 값들은 유통기한 내림차순으로
      .skip(option.offset)
      .take(option.limit)
      .getManyAndCount();

    const skus = entities.map((entity) => SkuMapper.toDomain(entity));
    return [skus, total];
  }

  async findByProductIdAndExpirationDate(productId: number, expirationDate?: Date): Promise<Sku | null> {
    const repository = this.getRepository();

    const entity = await repository.findOneBy({
      productId: productId,
      expirationDate: expirationDate ? expirationDate : IsNull(),
    });

    return entity ? SkuMapper.toDomain(entity) : null;
  }

  async findForUpdate(productId: number, expirationDate?: Date): Promise<Sku | null> {
    const repository = this.getRepository();

    const entityManager = this.contextManager.getCurrentEntityManager();

    if (!entityManager) {
      return this.findByProductIdAndExpirationDate(productId, expirationDate);
    }

    const entity = await repository.findOne({
      where: { productId: productId, expirationDate: expirationDate ? expirationDate : IsNull() },
      lock: { mode: 'pessimistic_write' }, // 여기서 실제 잠금을 적용
    });

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
