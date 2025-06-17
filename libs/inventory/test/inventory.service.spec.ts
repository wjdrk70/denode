import { SkU_REPOSITORY, SkuRepository } from '@app/inventory/domain/sku.repository';
import { InventoryService } from '@app/inventory';
import { PRODUCT_REPOSITORY, ProductRepository } from '@app/product/domain/product.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';
import { Product } from '@app/product/domain/product';
import { NotFoundException } from '@nestjs/common';
import { Sku } from '@app/inventory/domain/sku';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';
import { STOCK_HISTORY_REPOSITORY, StockHistoryRepository } from '@app/inventory/domain/stock-history.repository';
import { DataSource } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';

describe('InventoryService', () => {
  let service: jest.Mocked<InventoryService>;
  let skuRepository: jest.Mocked<SkuRepository>;
  let stockHistoryRepository: jest.Mocked<StockHistoryRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: SkU_REPOSITORY,
          useValue: createMock<SkuRepository>(),
        },
        {
          provide: STOCK_HISTORY_REPOSITORY,
          useValue: createMock<StockHistoryRepository>(),
        },
        {
          provide: PRODUCT_REPOSITORY,
          useValue: createMock<ProductRepository>(),
        },
        {
          provide: DataSource,
          useValue: createMock<DataSource>(),
        },
      ],
    }).compile();

    service = module.get(InventoryService);
    skuRepository = module.get(SkU_REPOSITORY);
    stockHistoryRepository = module.get(STOCK_HISTORY_REPOSITORY);
    productRepository = module.get(PRODUCT_REPOSITORY);
    dataSource = module.get(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('stockIn', () => {
    const stockInDto: StockInDto = {
      productId: 1,
      quantity: 10,
      expirationDate: new Date('2025-12-31'),
    };
    const product = new Product({
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
    });

    it('제품이 존재하지 않으면 NotFoundException을 던져야 한다', async () => {
      // given
      productRepository.findById.mockResolvedValue(null);

      // when & then
      await expect(service.stockInbound(stockInDto)).rejects.toThrow(new NotFoundException('제품을 찾을 수 없습니다.'));
    });

    it('새로운 재고 아이템을 성공적으로 입고 처리해야 한다', async () => {
      // given
      productRepository.findById.mockResolvedValue(product);
      skuRepository.findByProductIdAndExpirationDate.mockResolvedValue(null);

      const savedItem = new Sku({ ...stockInDto, id: 1 });
      skuRepository.save.mockResolvedValue(savedItem);

      // when
      await service.stockInbound(stockInDto);

      // then
      expect(stockHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          skuId: savedItem.id,
          type: StockHistoryType.INBOUND,
          quantity: stockInDto.quantity,
        }),
      );
    });

    it('기존에 존재하는 재고 아이템의 수량을 증가시켜야 한다', async () => {
      // given
      const existItem = new Sku({
        id: 1,
        productId: stockInDto.productId,
        quantity: 20,
        expirationDate: stockInDto.expirationDate,
      });

      productRepository.findById.mockResolvedValue(product);
      skuRepository.findByProductIdAndExpirationDate.mockResolvedValue(existItem);
      skuRepository.save.mockImplementation((item: Sku) => Promise.resolve(item));

      // when
      const result = await service.stockInbound(stockInDto);

      // then
      expect(result.quantity).toBe(30);
      expect(stockHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          skuId: existItem.id,
          type: StockHistoryType.INBOUND,
          quantity: stockInDto.quantity,
        }),
      );
    });
  });
});
