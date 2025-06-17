import { Injectable, NotFoundException } from '@nestjs/common';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';
import { Sku } from '@app/inventory/domain/sku';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { StockHistory } from '@app/inventory/domain/stock-history';

import { DataSource, EntityManager } from 'typeorm';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { SkuMapper } from '@app/storage/mapper/sku.mapper';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly dataSource: DataSource) {}

  async stockInbound(dto: StockInDto): Promise<Sku> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      await this.validateProductExists(dto.productId, manager);

      const sku = await this.gerOrInitSku(dto, manager);

      if (sku.id) {
        sku.increaseStock(dto.quantity);
      }

      const entityToSave = SkuMapper.toEntity(sku);
      const saveSku = await manager.save(SkuEntity, entityToSave);

      await this.createInboundHistory(saveSku.id, dto.quantity, manager);

      return SkuMapper.toDomain(saveSku);
    });
  }

  private async validateProductExists(productId: number, manager: EntityManager): Promise<void> {
    const product = await manager.findOneBy(ProductEntity, { id: productId });
    if (!product) {
      throw new NotFoundException(`제품을 찾을 수 없습니다.`);
    }
  }

  private async gerOrInitSku(dto: StockInDto, manager: EntityManager): Promise<Sku> {
    const entity = await manager.findOneBy(SkuEntity, { productId: dto.productId, expirationDate: dto.expirationDate });
    return entity
      ? SkuMapper.toDomain(entity)
      : Sku.create({
          productId: dto.productId,
          quantity: dto.quantity,
          expirationDate: dto.expirationDate,
        });
  }

  private async createInboundHistory(skuId: number, quantity: number, manager: EntityManager): Promise<void> {
    const historyData = {
      skuId: skuId,
      type: StockHistoryType.INBOUND,
      quantity: quantity,
    };

    await manager.save(StockHistoryEntity, historyData);
  }
}
