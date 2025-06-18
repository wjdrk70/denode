import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';
import { Sku } from '@app/inventory/domain/sku';
import { PRODUCT_REPOSITORY, ProductRepository } from '@app/product/domain/product.repository';
import { SKU_REPOSITORY, SkuRepository } from '@app/inventory/domain/sku.repository';
import { TRANSACTION_HANDLER, TransactionHandler } from '@app/transaction/transaction-handler';
import { StockHistory } from '@app/inventory/domain/stock-history';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { STOCK_HISTORY_REPOSITORY, StockHistoryRepository } from '@app/inventory/domain/stock-history.repository';
import { StockOutDto } from '@app/inventory/dto/stock-out.dto';

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

      try {
        sku.increaseStock(dto.quantity);
      } catch (e) {
        throw new BadRequestException(e.message);
      }

      const saveSku = await this.skuRepository.save(sku);

      await this.createStockHistory(saveSku, dto.quantity, StockHistoryType.INBOUND);

      return saveSku;
    });
  }

  async stockOutbound(dto: StockOutDto): Promise<Sku> {
    return this.transactionHandler.run(async () => {
      await this.validateProductExists(dto.productId);

      const sku = await this.validateSkuExists(dto.productId, dto.expirationDate);

      try {
        sku.decreaseStock(dto.quantity);
      } catch (e) {
        throw new BadRequestException(e.message);
      }

      const saveSku = await this.skuRepository.save(sku);

      await this.createStockHistory(saveSku, dto.quantity, StockHistoryType.OUTBOUND);

      return saveSku;
    });
  }

  private async validateProductExists(productId: number): Promise<void> {
    const exists = await this.productRepository.findById(productId);
    if (!exists) {
      throw new NotFoundException(`제품을 찾을 수 없습니다.`);
    }
  }

  private async validateSkuExists(productId: number, expirationDate?: Date): Promise<Sku> {
    const sku = await this.skuRepository.findByProductIdAndExpirationDate(productId, expirationDate);
    if (!sku) {
      throw new NotFoundException('SKU를 찾을 수 없습니다.');
    }
    return sku;
  }

  private async getOrCreateSku(dto: StockInDto): Promise<Sku> {
    const existSku = await this.skuRepository.findByProductIdAndExpirationDate(dto.productId, dto.expirationDate);
    if (existSku) {
      return existSku;
    }

    return Sku.create({
      productId: dto.productId,
      quantity: dto.quantity,
      expirationDate: dto.expirationDate,
    });
  }

  private async createStockHistory(sku: Sku, quantity: number, type: StockHistoryType): Promise<void> {
    const stockHistory = StockHistory.create({
      skuId: sku.id!,
      type: type,
      quantity: quantity,
    });

    await this.stockHistoryRepository.save(stockHistory);
  }
}
