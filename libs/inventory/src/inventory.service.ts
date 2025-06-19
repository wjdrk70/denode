import { Inject, Injectable } from '@nestjs/common';
import { StockRequestDto } from '@app/inventory/dto/request/stock-request.dto';
import { Sku } from '@app/inventory/domain/sku';
import { PRODUCT_REPOSITORY, ProductRepository } from '@app/product/domain/product.repository';
import { SKU_REPOSITORY, SkuRepository } from '@app/inventory/domain/sku.repository';
import { TRANSACTION_HANDLER, TransactionHandler } from '@app/transaction/transaction-handler';
import { StockHistory } from '@app/inventory/domain/stock-history';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { STOCK_HISTORY_REPOSITORY, StockHistoryRepository } from '@app/inventory/domain/stock-history.repository';
import { ProductNotFoundException } from '@app/product/support/exception/product-not-found.exception';
import { SkuNotFoundException } from '@app/inventory/support/exception/sku-not-found.exception';
import { StockListRequestDto } from '@app/inventory/dto/request/stock-list-request.dto';
import { StockListResponseDto } from '@app/inventory/dto/response/stock-list-response.dto';
import { StockHistoryListResponseDto } from '@app/inventory/dto/response/stock-history-list.response.dto';
import { StockHistoryRequestDto } from '@app/inventory/dto/request/stock-history-request.dto';
import { OutboundRequestDto } from '@app/inventory/dto/request/outbound-request.dto';
import { InsufficientStockException } from '@app/inventory/support/exception/insufficient-stock.exception';

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

  async getStock(dto: StockListRequestDto): Promise<StockListResponseDto> {
    const [skus, total] = await this.skuRepository.findAndCount({
      offset: dto.offset,
      limit: dto.limit,
    });

    return new StockListResponseDto(skus, total);
  }

  async getStockHistory(productId: number, dto: StockHistoryRequestDto): Promise<StockHistoryListResponseDto> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new ProductNotFoundException();
    }

    let targetSkuIds: number[];

    if (dto.expirationDate) {
      // 유통기한 필터가 있으면 특정 SKU만 조회
      const specificSku = await this.skuRepository.findByProductIdAndExpirationDate(productId, dto.expirationDate);
      if (!specificSku) return new StockHistoryListResponseDto([], 0); // 히스토리가 없으므로 빈 배열 반환
      targetSkuIds = [specificSku.id];
    } else {
      // 필터가 없으면 제품에 속한 모든 SKU 조회
      const skus = await this.skuRepository.findByProductId(productId);
      if (skus.length === 0) return new StockHistoryListResponseDto([], 0);
      targetSkuIds = skus.map((sku) => sku.id);
    }

    // SKU ID들로 히스토리 조회
    const [histories, total] = await this.stockHistoryRepository.findAndCountBySkuIds(targetSkuIds, {
      offset: dto.offset,
      limit: dto.limit,
    });

    return new StockHistoryListResponseDto(histories, total);
  }

  async stockInbound(dto: StockRequestDto, userId: number): Promise<Sku> {
    return this.transactionHandler.run(async () => {
      await this.validateProductExists(dto.productId);

      const sku = await this.getOrCreateSku(dto);

      sku.increaseStock(dto.quantity);

      const saveSku = await this.skuRepository.save(sku);

      await this.createStockHistory(saveSku, dto.quantity, StockHistoryType.INBOUND, userId);

      return saveSku;
    });
  }

  async stockOutbound(dto: OutboundRequestDto, userId: number): Promise<void> {
    return this.transactionHandler.run(async () => {
      // 1. 제품 존재 여부 확인
      await this.validateProductExists(dto.productId);

      // 2. 출고할 제품의 SKU들을 FEFO 순서로, 비관적 락을 걸어 조회
      const skusToShipFrom = await this.skuRepository.findForUpdateByProductId(dto.productId);

      // 3. 전체 재고량 확인
      const totalStock = skusToShipFrom.reduce((sum, sku) => sum + sku.quantity, 0);
      if (totalStock < dto.quantity) {
        throw new InsufficientStockException();
      }

      let remainingQuantityToShip = dto.quantity;

      // 4. FEFO 순서대로 재고 차감
      for (const sku of skusToShipFrom) {
        if (remainingQuantityToShip <= 0) break;

        const quantityToDecrease = Math.min(sku.quantity, remainingQuantityToShip);

        if (quantityToDecrease > 0) {
          sku.decreaseStock(quantityToDecrease);
          await this.skuRepository.save(sku);
          await this.createStockHistory(sku, quantityToDecrease, StockHistoryType.OUTBOUND, userId);

          remainingQuantityToShip -= quantityToDecrease;
        }
      }
    });
  }

  private async validateProductExists(productId: number): Promise<void> {
    const exists = await this.productRepository.findById(productId);
    if (!exists) {
      throw new ProductNotFoundException();
    }
  }

  private async validateSkuExists(productId: number, expirationDate?: Date): Promise<Sku> {
    const sku = await this.skuRepository.findForUpdate(productId, expirationDate);
    if (!sku) {
      throw new SkuNotFoundException();
    }
    return sku;
  }

  private async getOrCreateSku(dto: StockRequestDto): Promise<Sku> {
    const existSku = await this.skuRepository.findForUpdate(dto.productId, dto.expirationDate);
    if (existSku) {
      return existSku;
    }

    return Sku.createEmpty({
      productId: dto.productId,
      expirationDate: dto.expirationDate,
    });
  }

  private async createStockHistory(sku: Sku, quantity: number, type: StockHistoryType, userId: number): Promise<void> {
    const stockHistory = StockHistory.create({
      skuId: sku.id,
      userId: userId,
      type: type,
      quantity: quantity,
    });

    await this.stockHistoryRepository.save(stockHistory);
  }
}
