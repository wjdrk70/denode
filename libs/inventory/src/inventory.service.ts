import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SkU_REPOSITORY, SkuRepository } from '@app/inventory/domain/sku.repository';
import { PRODUCT_REPOSITORY, ProductRepository } from '@app/product/domain/product.repository';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';
import { Sku } from '@app/inventory/domain/sku';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { StockHistory } from '@app/inventory/domain/stock-history';
import { STOCK_HISTORY_REPOSITORY, StockHistoryRepository } from '@app/inventory/domain/stock-history.repository';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(SkU_REPOSITORY)
    private readonly skuRepository: SkuRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(STOCK_HISTORY_REPOSITORY)
    private readonly stockHistoryRepository: StockHistoryRepository,
  ) {}

  async stockInbound(dto: StockInDto): Promise<Sku> {
    await this.validateProductExists(dto.productId);

    const sku = await this.gerOrInitSku(dto);

    if (sku.id) {
      sku.increaseStock(dto.quantity);
    }

    const saveSku = await this.skuRepository.save(sku);

    await this.createInboundHistory(saveSku.id, dto.quantity);

    return saveSku;
  }

  private async validateProductExists(productId: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('제품을 찾을 수 없습니다.');
    }
  }

  private async gerOrInitSku(dto: StockInDto): Promise<Sku> {
    const sku = await this.skuRepository.findByProductIdAndExpirationDate(dto.productId, dto.expirationDate);
    return (
      sku ??
      Sku.create({
        productId: dto.productId,
        quantity: dto.quantity,
        expirationDate: dto.expirationDate,
      })
    );
  }

  private async createInboundHistory(skuId: number, quantity: number): Promise<void> {
    const history = new StockHistory({
      skuId: skuId,
      type: StockHistoryType.INBOUND,
      quantity,
    });
    await this.stockHistoryRepository.save(history);
  }
}
