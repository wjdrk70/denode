import { InventoryService } from '@app/inventory';
import { Test, TestingModule } from '@nestjs/testing';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';
import { Product } from '@app/product/domain/product';
import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';
import { StockHistoryType } from '@app/inventory/domain/stock-history.type';

describe('InventoryService', () => {
  let service: InventoryService;
  let dataSource: jest.Mocked<DataSource>;
  let mockManager: jest.Mocked<EntityManager>;

  beforeEach(async () => {
    mockManager = createMock<EntityManager>();
    dataSource = createMock<DataSource>();
    dataSource.transaction = jest.fn().mockImplementation(async (callback) => {
      return callback(mockManager);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryService, { provide: DataSource, useValue: dataSource }],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
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
      mockManager.findOneBy.mockResolvedValue(null);

      // when & then
      await expect(service.stockInbound(stockInDto)).rejects.toThrow(new NotFoundException('제품을 찾을 수 없습니다.'));
    });

    it('새로운 재고 아이템을 성공적으로 입고 처리해야 한다', async () => {
      // given
      const productEntity = { id: 1 } as ProductEntity;
      const savedSkuEntity = { id: 1, productId: 1, quantity: 10 } as SkuEntity;
      const historyToSave = { skuId: 1, type: StockHistoryType.INBOUND, quantity: 10 };

      mockManager.findOneBy.mockResolvedValueOnce(productEntity);
      mockManager.findOneBy.mockResolvedValueOnce(null);
      mockManager.save.mockResolvedValueOnce(savedSkuEntity).mockResolvedValueOnce({ ...historyToSave, id: 2 });

      // when
      await service.stockInbound(stockInDto);

      // then
      expect(mockManager.save).toHaveBeenCalledWith(SkuEntity, expect.any(Object));
      expect(mockManager.save).toHaveBeenCalledWith(StockHistoryEntity, expect.objectContaining(historyToSave));
    });

    it('기존에 존재하는 재고 아이템의 수량을 증가시켜야 한다', async () => {
      // given
      const productEntity = { id: 1 } as ProductEntity;
      const existSkuEntity = {
        id: 1,
        productId: 1,
        quantity: 20,
        expirationDate: stockInDto.expirationDate,
      } as SkuEntity;
      const historyEntity = { skuId: 1, type: StockHistoryType.INBOUND, quantity: 10 } as StockHistoryEntity;

      mockManager.findOneBy.mockResolvedValueOnce(productEntity);
      mockManager.findOneBy.mockResolvedValueOnce(existSkuEntity);
      mockManager.save
        .mockImplementationOnce(async (_, entity: SkuEntity) => ({ ...entity, id: 1 })) // Sku 업데이트
        .mockResolvedValueOnce(historyEntity);

      // when
      const result = await service.stockInbound(stockInDto);

      // then
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockManager.save).toHaveBeenCalledWith(SkuEntity, expect.objectContaining({ quantity: 30 }));
      expect(result.quantity).toBe(30);
    });
  });
});
