import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/storage/entity/user.entity';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreApiModule } from '@api/core-api.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';

describe('InventoryController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let productRepository: Repository<ProductEntity>;
  let skuRepository: Repository<SkuEntity>;
  let stockHistoryRepository: Repository<StockHistoryEntity>;
  let accessToken: string;
  let product: ProductEntity;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CoreApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    userRepository = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    productRepository = moduleFixture.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    skuRepository = moduleFixture.get<Repository<SkuEntity>>(getRepositoryToken(SkuEntity));
    stockHistoryRepository = moduleFixture.get<Repository<StockHistoryEntity>>(getRepositoryToken(StockHistoryEntity));

    await app.init();
  });

  beforeEach(async () => {
    // 테스트 데이터 정리
    await stockHistoryRepository.clear();
    await skuRepository.clear();
    await productRepository.clear();
    await userRepository.clear();

    // 테스트용 사용자 생성 및 로그인
    const userCredentials = { email: 'stocktest@example.com', password: 'password123' };
    await request(app.getHttpServer()).post('/auth/signup').send(userCredentials);
    const loginResponse = await request(app.getHttpServer()).post('/auth/signin').send(userCredentials);
    accessToken = loginResponse.body.accessToken;

    // 테스트용 제품 생성
    const createProductDto = { name: '초코에몽 190ml * 5', description: '재고 테스트용' };
    const productResponse = await request(app.getHttpServer())
      .post('/product')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createProductDto);
    product = productResponse.body;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/inventory/inbound (POST)', () => {
    it('성공적으로 재고를 입고하고 201 Created를 반환해야 한다', async () => {
      // given
      const stockInDto: StockInDto = {
        productId: product.id,
        quantity: 50,
        expirationDate: new Date('2026-01-01'),
      };

      // when
      const response = await request(app.getHttpServer())
        .post('/inventory/inbound')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(stockInDto)
        .expect(201);

      // then
      expect(response.body.productId).toBe(product.id);
      expect(response.body.quantity).toBe(50);

      const skuInDb = await skuRepository.findOneBy({ productId: product.id });
      expect(skuInDb).toBeDefined();
      expect(skuInDb.quantity).toBe(50);

      const historyInDb = await stockHistoryRepository.findOneBy({ skuId: skuInDb.id });
      expect(historyInDb).toBeDefined();
      expect(historyInDb.quantity).toBe(50);
      expect(historyInDb.type).toBe('INBOUND');
    });

    it('기존에 있는 SKU에 재고를 추가해야 한다', async () => {
      // given:
      const stockInDto: StockInDto = {
        productId: product.id,
        quantity: 20,
        expirationDate: new Date('2026-01-01'),
      };
      await request(app.getHttpServer())
        .post('/inventory/inbound')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(stockInDto);

      // when
      const response = await request(app.getHttpServer())
        .post('/inventory/inbound')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...stockInDto, quantity: 30 })
        .expect(201);

      // then
      expect(response.body.quantity).toBe(50);

      const skuInDb = await skuRepository.findOneBy({ productId: product.id });
      expect(skuInDb.quantity).toBe(50);
    });

    it('인증 토큰 없이 요청 시 401 Unauthorized를 반환해야 한다', () => {
      // given
      const stockInDto: StockInDto = { productId: product.id, quantity: 10 };

      // when & then
      return request(app.getHttpServer()).post('/inventory/inbound').send(stockInDto).expect(401);
    });

    it('유효하지 않은 데이터로 요청 시 400 Bad Request를 반환해야 한다', () => {
      // given: quantity가 0 이하
      const invalidDto: StockInDto = { productId: product.id, quantity: 0 };

      // when & then
      return request(app.getHttpServer())
        .post('/inventory/inbound')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('존재하지 않는 제품 ID로 요청 시 404 Not Found를 반환해야 한다', () => {
      // given
      const stockInDto: StockInDto = { productId: 999, quantity: 10 };

      // when & then
      return request(app.getHttpServer())
        .post('/inventory/inbound')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(stockInDto)
        .expect(404);
    });
  });
});
