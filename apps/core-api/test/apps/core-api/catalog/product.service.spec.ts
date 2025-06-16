import { PRODUCT_REPOSITORY, ProductRepository } from '@app/domain/catalog/product.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from '@api/catalog/dto/create-product.dto';
import { Product } from '@app/domain/catalog/product';
import { ProductService } from '@api/catalog/product.service';
import { ConflictException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: ProductRepository;

  // Mock Repository
  const mockProductRepository = {
    save: jest.fn(),
    findByName: jest.fn(), // 중복 체크를 위해 추가
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<ProductRepository>(PRODUCT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트가 끝난 후 mock을 초기화합니다.
  });

  describe('createProduct', () => {
    const createProductDto: CreateProductDto = {
      name: '초코에몽 190ml * 10',
      description: '초코에몽 190ml unit 1',
    };

    it('새로운 제품을 성공적으로 생성해야 한다', async () => {
      // given
      const product = Product.create(createProductDto);
      (mockProductRepository.findByName as jest.Mock).mockResolvedValue(null);
      (mockProductRepository.save as jest.Mock).mockResolvedValue(new Product({ ...product, id: 1 }));

      // when
      const result = await service.createProduct(createProductDto);

      // then
      expect(productRepository.findByName).toHaveBeenCalledWith(createProductDto.name);
      expect(productRepository.save).toHaveBeenCalledWith(expect.any(Product));
      expect(result.id).toBeDefined();
      expect(result.name).toEqual(createProductDto.name);
    });

    it('이미 존재하는 이름의 제품을 생성하려고 하면 ConflictException을 던져야 한다', async () => {
      // given
      const existingProduct = Product.create(createProductDto);
      (mockProductRepository.findByName as jest.Mock).mockResolvedValue(existingProduct);

      // when & then
      await expect(service.createProduct(createProductDto)).rejects.toThrow(
        new ConflictException('이미 존재하는 제품 이름입니다.'),
      );
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });
});
