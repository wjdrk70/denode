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

  async findByProductId(productId: number): Promise<Sku[]> {
    const entities = await this.getRepository().find({
      where: {
        product: {
          id: productId,
        },
      },
      relations: {
        product: true,
      },
    });
    return entities.map(SkuMapper.toDomain);
  }

  async findAndCount(option: { offset: number; limit: number }): Promise<[Sku[], number]> {
    const repository = this.getRepository();
    const queryBuilder = repository.createQueryBuilder('sku');

    const [entities, total] = await queryBuilder
      .leftJoinAndSelect('sku.product', 'product')
      .addSelect('CASE WHEN sku.expirationDate IS NULL THEN 0 ELSE 1 END', 'nullOrder')
      .orderBy('nullOrder', 'ASC') // NULL이 먼저 (0)
      .addOrderBy('sku.expirationDate', 'DESC')
      .skip(option.offset)
      .take(option.limit)
      .getManyAndCount();

    const skus = entities.map((entity) => SkuMapper.toDomain(entity));
    return [skus, total];
  }

  async findByProductIdAndExpirationDate(productId: number, expirationDate?: Date): Promise<Sku | null> {
    const repository = this.getRepository();

    const entity = await repository.findOne({
      where: {
        product: {
          id: productId,
        },
        expirationDate: expirationDate ? expirationDate : IsNull(),
      },
      relations: {
        product: true,
      },
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
      where: {
        product: {
          id: productId, // 1. product.id로 조회하도록 변경
        },
        expirationDate: expirationDate ? expirationDate : IsNull(),
      },
      lock: { mode: 'pessimistic_write' },
      relations: {
        product: true, // 2. SkuMapper가 product 정보를 필요로 하므로 함께 로드
      },
    });

    return entity ? SkuMapper.toDomain(entity) : null;
  }

  async findForUpdateByProductId(productId: number): Promise<Sku[]> {
    const entityManager = this.contextManager.getCurrentEntityManager();
    const repository = entityManager ? entityManager.getRepository(SkuEntity) : this.skuRepository;

    const queryBuilder = repository.createQueryBuilder('sku');

    const entities = await queryBuilder
      .leftJoinAndSelect('sku.product', 'product')
      .where('sku.product.id = :productId', { productId })
      // highlight-start
      // 1. 유통기한이 있는 것(0)을 없는 것(1)보다 우선 정렬합니다.
      .orderBy('CASE WHEN sku.expirationDate IS NULL THEN 1 ELSE 0 END', 'ASC')
      // 2. 유통기한이 있는 것들끼리는 날짜가 빠른 순(오름차순)으로 정렬합니다.
      .addOrderBy('sku.expirationDate', 'ASC')
      // highlight-end
      .setLock('pessimistic_write')
      .getMany();

    return entities.map(SkuMapper.toDomain);
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
