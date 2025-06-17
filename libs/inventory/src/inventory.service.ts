import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';
import { Sku } from '@app/inventory/domain/sku';
import { PRODUCT_REPOSITORY, ProductRepository } from '@app/product/domain/product.repository';
import { SKU_REPOSITORY, SkuRepository } from '@app/inventory/domain/sku.repository';
import { TRANSACTION_HANDLER, TransactionHandler } from '@app/transaction/transaction-handler';
import { StockHistory } from '@app/inventory/domain/stock-history';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { STOCK_HISTORY_REPOSITORY, StockHistoryRepository } from '@app/inventory/domain/stock-history.repository';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(SKU_REPOSITORY)
    private readonly skuRepository: SkuRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(STOCK_HISTORY_REPOSITORY)
    private readonly stockHistoryRepository: StockHistoryRepository,
    @Inject(TRANSACTION_HANDLER)
    private readonly transactionHandler: TransactionHandler,
  ) {}

  async stockInbound(dto: StockInDto): Promise<Sku> {
    return this.transactionHandler.run(async () => {
      await this.validateProductExists(dto.productId);

      const sku = await this.getOrCreateSku(dto);

      const saveSku = await this.skuRepository.save(sku);

      await this.createStockHistory(saveSku, dto.quantity);

      return saveSku;
    });
  }

  private async validateProductExists(productId: number): Promise<void> {
    const exists = await this.productRepository.findById(productId);
    if (!exists) {
      throw new NotFoundException(`제품을 찾을 수 없습니다.`);
    }
  }

  private async getOrCreateSku(dto: StockInDto): Promise<Sku> {
    const existingSku = await this.skuRepository.findByProductIdAndExpirationDate(dto.productId, dto.expirationDate);

    if (existingSku) {
      existingSku.increaseStock(dto.quantity);
      return existingSku;
    }

    return Sku.create({
      productId: dto.productId,
      quantity: dto.quantity,
      expirationDate: dto.expirationDate,
    });
  }

  private async createStockHistory(sku: Sku, quantity: number): Promise<void> {
    const stockHistory = StockHistory.create({
      skuId: sku.id!,
      type: StockHistoryType.INBOUND,
      quantity: quantity,
    });

    await this.stockHistoryRepository.save(stockHistory);
  }
}
