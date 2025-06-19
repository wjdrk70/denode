import { InventoryService } from '@app/inventory';
import { Test, TestingModule } from '@nestjs/testing';
import { StockRequestDto } from '@app/inventory/dto/request/stock-request.dto';
import { Product } from '@app/product/domain/product';
import { createMock } from '@golevelup/ts-jest';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { SKU_REPOSITORY, SkuRepository } from '@app/inventory/domain/sku.repository';
import { STOCK_HISTORY_REPOSITORY, StockHistoryRepository } from '@app/inventory/domain/stock-history.repository';
import { PRODUCT_REPOSITORY, ProductRepository } from '@app/product/domain/product.repository';
import { TRANSACTION_HANDLER, TransactionHandler } from '@app/transaction/transaction-handler';
import { Sku } from '@app/inventory/domain/sku';
import { StockHistory } from '@app/inventory/domain/stock-history';
import { ProductNotFoundException } from '@app/product/support/exception/product-not-found.exception';
import { SkuNotFoundException } from '@app/inventory/support/exception/sku-not-found.exception';
import { InsufficientStockException } from '@app/inventory/support/exception/insufficient-stock.exception';
import { StockListRequestDto } from '@app/inventory/dto/request/stock-list-request.dto';
import { StockListResponseDto } from '@app/inventory/dto/response/stock-list-response.dto';
import { StockHistoryListResponseDto } from '@app/inventory/dto/response/stock-history-list.response.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let skuRepository: jest.Mocked<SkuRepository>;
  let stockHistoryRepository: jest.Mocked<StockHistoryRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let transactionHandler: jest.Mocked<TransactionHandler>;

  beforeEach(async () => {
    skuRepository = createMock<SkuRepository>();
    stockHistoryRepository = createMock<StockHistoryRepository>();
    productRepository = createMock<ProductRepository>();
    transactionHandler = createMock<TransactionHandler>();

    transactionHandler.run.mockImplementation(async (callback) => {
      return callback();
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: SKU_REPOSITORY, useValue: skuRepository },
        { provide: STOCK_HISTORY_REPOSITORY, useValue: stockHistoryRepository },
        { provide: PRODUCT_REPOSITORY, useValue: productRepository },
        { provide: TRANSACTION_HANDLER, useValue: transactionHandler },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStockList', () => {
    it('요청된 offset과 limit에 따라 페이지네이션된 재고 목록과 전체 개수를 반환해야 한다 ', async () => {
      // given
      const dto = new StockListRequestDto();
      dto.offset = 10;
      dto.limit = 5;

      const mockSkus = [new Sku({ id: 1, productId: 1, quantity: 10 }), new Sku({ id: 2, productId: 2, quantity: 20 })];
      const totalCount = 50;

      skuRepository.findAndCount.mockResolvedValue([mockSkus, totalCount]);

      // when
      const result = await service.getStock(dto);

      // then
      expect(skuRepository.findAndCount).toHaveBeenCalledWith({
        offset: dto.offset,
        limit: dto.limit,
      });

      expect(result).toBeInstanceOf(StockListResponseDto);
      expect(result.items).toHaveLength(mockSkus.length);
      expect(result.total).toBe(totalCount);
      expect(result.items[0].id).toBe(mockSkus[0].id);
      expect(result.items[1].quantity).toBe(mockSkus[1].quantity);
    });
  });

  describe('stockInbound', () => {
    const userId = 101;

    const stockInDto: StockRequestDto = {
      productId: 1,
      quantity: 10,
      expirationDate: new Date('2025-12-31'),
    };
    const product = new Product({
      id: 1,
      name: '초코에몽 190ml * 10',
      description: '초코에몽 190ml sku 1',
    });

    it('제품이 존재하지 않으면 NotFoundException을 던져야 한다', async () => {
      // given
      productRepository.findById.mockResolvedValue(null);

      // when & then
      await expect(service.stockInbound(stockInDto, userId)).rejects.toThrow(new ProductNotFoundException());

      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
      expect(productRepository.findById).toHaveBeenCalledWith(1);
    });

    it('새로운 재고 아이템을 성공적으로 입고 처리해야 한다', async () => {
      // given
      const newSku = Sku.create({
        productId: stockInDto.productId,
        quantity: 0,
        expirationDate: stockInDto.expirationDate,
      });

      const savedSku = new Sku({
        id: 1,
        productId: stockInDto.productId,
        quantity: stockInDto.quantity,
        expirationDate: stockInDto.expirationDate,
      });

      productRepository.findById.mockResolvedValue(product);
      skuRepository.findForUpdate.mockResolvedValue(null);
      skuRepository.save.mockResolvedValue(savedSku);

      // when
      const result = await service.stockInbound(stockInDto, userId);

      // then
      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
      expect(productRepository.findById).toHaveBeenCalledWith(1);
      expect(skuRepository.findForUpdate).toHaveBeenCalledWith(stockInDto.productId, stockInDto.expirationDate);
      expect(skuRepository.save).toHaveBeenCalledWith(expect.any(Sku));
      expect(stockHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          skuId: 1,
          type: StockHistoryType.INBOUND,
          quantity: 10,
        }),
      );
      expect(result).toEqual(savedSku);
    });

    it('기존에 존재하는 재고 아이템의 수량을 증가시켜야 한다', async () => {
      // given
      const existingSku = new Sku({
        id: 1,
        productId: stockInDto.productId,
        quantity: 20,
        expirationDate: stockInDto.expirationDate,
      });

      const updatedSku = new Sku({
        id: 1,
        productId: stockInDto.productId,
        quantity: 30,
        expirationDate: stockInDto.expirationDate,
      });

      const savedStockHistory = new StockHistory({
        id: 1,
        skuId: 1,
        type: StockHistoryType.INBOUND,
        quantity: stockInDto.quantity,
        userId,
      });

      productRepository.findById.mockResolvedValue(product);
      skuRepository.findForUpdate.mockResolvedValue(existingSku);
      skuRepository.save.mockResolvedValue(updatedSku);
      stockHistoryRepository.save.mockResolvedValue(savedStockHistory);

      // when
      const result = await service.stockInbound(stockInDto, userId);

      // then
      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
      expect(skuRepository.findForUpdate).toHaveBeenCalledWith(stockInDto.productId, stockInDto.expirationDate);
      expect(skuRepository.save).toHaveBeenCalledWith(expect.objectContaining({ quantity: 30 }));
      expect(stockHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          skuId: 1,
          type: StockHistoryType.INBOUND,
          quantity: 10,
        }),
      );
      expect(result.quantity).toBe(30);
    });

    it('트랜잭션 내에서 에러가 발생하면 전체 작업이 롤백되어야 한다', async () => {
      // given
      productRepository.findById.mockResolvedValue(product);
      skuRepository.findByProductIdAndExpirationDate.mockResolvedValue(null);
      skuRepository.save.mockRejectedValue(new Error('Database error'));

      // when & then
      await expect(service.stockInbound(stockInDto, userId)).rejects.toThrow('Database error');

      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
      expect(stockHistoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('stockOutbound', () => {
    const userId = 102;
    const stockOutDto: StockRequestDto = {
      productId: 1,
      quantity: 5,
      expirationDate: new Date('2025-12-31'),
    };
    const product = new Product({
      id: 1,
      name: '초코에몽 190ml * 10',
      description: '초코에몽 190ml sku 1',
    });

    it('제품이 없으면 ProductNotFoundException 던져야 한다', async () => {
      // given
      productRepository.findById.mockResolvedValue(null);

      // when & then
      await expect(service.stockOutbound(stockOutDto, userId)).rejects.toThrow(new ProductNotFoundException());
      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
      expect(productRepository.findById).toHaveBeenCalledWith(stockOutDto.productId);
    });

    it('SKU가 없으면 SkuNotFoundException 던져야 한다', async () => {
      // given
      productRepository.findById.mockResolvedValue(product);
      skuRepository.findForUpdate.mockResolvedValue(null);

      // when & then
      await expect(service.stockOutbound(stockOutDto, userId)).rejects.toThrow(new SkuNotFoundException());
      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
    });

    it('재고가 부족하면 InsufficientStockError 던져야 한다', async () => {
      // given
      const existingSku = new Sku({
        id: 1,
        productId: stockOutDto.productId,
        quantity: 3, // 출고 수량보다 적은 재고
        expirationDate: stockOutDto.expirationDate,
      });
      productRepository.findById.mockResolvedValue(product);
      skuRepository.findForUpdate.mockResolvedValue(existingSku);

      // when & then
      await expect(service.stockOutbound(stockOutDto, userId)).rejects.toThrow(new InsufficientStockException());
      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
    });

    it('성공적으로 재고를 출고해야 한다', async () => {
      // given
      const initialQuantity = 10;
      const outboundQuantity = 5;
      const finalQuantity = initialQuantity - outboundQuantity;

      const existingSku = new Sku({
        id: 1,
        productId: stockOutDto.productId,
        quantity: 10,
        expirationDate: stockOutDto.expirationDate,
      });

      const updatedSku = new Sku({ ...existingSku, quantity: 5 });

      productRepository.findById.mockResolvedValue(product);
      skuRepository.findForUpdate.mockResolvedValue(existingSku);
      skuRepository.save.mockResolvedValue(updatedSku);

      // when
      const result = await service.stockOutbound(stockOutDto, userId);

      // then
      expect(transactionHandler.run).toHaveBeenCalledTimes(1);
      expect(skuRepository.findForUpdate).toHaveBeenCalledWith(stockOutDto.productId, stockOutDto.expirationDate);
      expect(skuRepository.save).toHaveBeenCalledWith(expect.objectContaining({ quantity: 5 }));
      expect(stockHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          skuId: existingSku.id,
          type: StockHistoryType.OUTBOUND,
          quantity: 5,
        }),
      );
      expect(result.quantity).toBe(5);
    });
  });

  describe('getStockHistory', () => {
    const skuId = 1;
    const paginationDto = new StockListRequestDto();
    paginationDto.offset = 0;
    paginationDto.limit = 10;

    it('존재하지 않는 SKU의 히스토리를 조회하면 SkuNotFoundException을 던져야 한다', async () => {
      // given

      skuRepository.findById.mockResolvedValue(null);

      // when & then
      await expect(service.getStockHistory(skuId, paginationDto)).rejects.toThrow(new SkuNotFoundException());
      expect(skuRepository.findById).toHaveBeenCalledWith(skuId);
    });

    it('성공적으로 특정 SKU의 입출고 히스토리를 페이지네이션하여 반환해야 한다', async () => {
      // given
      const mockSku = new Sku({ id: skuId, productId: 1, quantity: 100 });
      const mockHistories = [
        new StockHistory({ id: 1, skuId, userId: 1, type: StockHistoryType.INBOUND, quantity: 10 }),
        new StockHistory({ id: 2, skuId, userId: 1, type: StockHistoryType.OUTBOUND, quantity: 5 }),
      ];
      const totalCount = 20;

      skuRepository.findById.mockResolvedValue(mockSku);
      stockHistoryRepository.findAndCountBySkuId.mockResolvedValue([mockHistories, totalCount]);

      // when
      const result = await service.getStockHistory(skuId, paginationDto);

      // then
      expect(skuRepository.findById).toHaveBeenCalledWith(skuId);
      expect(stockHistoryRepository.findAndCountBySkuId).toHaveBeenCalledWith(skuId, {
        offset: paginationDto.offset,
        limit: paginationDto.limit,
      });
      expect(result).toBeInstanceOf(StockHistoryListResponseDto);
      expect(result.total).toBe(totalCount);
      expect(result.items).toHaveLength(mockHistories.length);
      expect(result.items[0].type).toBe(StockHistoryType.INBOUND);
    });
  });
});
