import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/storage/entity/user.entity';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';

import { getRepositoryToken } from '@nestjs/typeorm';
import { StockRequestDto } from '@app/inventory/dto/request/stock-request.dto';
import { createTestApp, createTestProduct, createTestSku, createTestUserAndLogin } from './test-data.setup';
import { OutboundRequestDto } from '@app/inventory/dto/request/outbound-request.dto';

describe('InventoryController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let productRepository: Repository<ProductEntity>;
  let skuRepository: Repository<SkuEntity>;
  let stockHistoryRepository: Repository<StockHistoryEntity>;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    app = await createTestApp();
    accessToken = (
      await createTestUserAndLogin(app, {
        email: 'inbound@test.com',
        password: 'password123',
      })
    ).accessToken;
    productRepository = app.get<Repository<ProductEntity>>(getRepositoryToken(ProductEntity));
    userRepository = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    skuRepository = app.get<Repository<SkuEntity>>(getRepositoryToken(SkuEntity));
    stockHistoryRepository = app.get<Repository<StockHistoryEntity>>(getRepositoryToken(StockHistoryEntity));
  });

  afterAll(async () => {
    await userRepository.clear();
    await app.close();
  });
  describe('POST /inventory/inbound, /inventory/outbound', () => {
    let product: ProductEntity;

    beforeEach(async () => {
      await stockHistoryRepository.clear();
      await skuRepository.clear();
      await productRepository.clear();
      product = (await createTestProduct(app, accessToken, 1))[0];
    });

    describe('/inventory/inbound (POST)', () => {
      it('성공적으로 재고를 입고해야 한다', async () => {
        const stockInDto: StockRequestDto = {
          productId: product.id,
          quantity: 50,
          expirationDate: new Date('2026-01-01'),
        };
        await request(app.getHttpServer())
          .post('/inventory/inbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(stockInDto)
          .expect(200);
      });

      it('기존에 있는 SKU에 재고를 추가해야 한다', async () => {
        // given:
        const stockInDto: StockRequestDto = {
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
          .expect(200);

        // then
        expect(response.body.quantity).toBe(50);

        const skuInDb = await skuRepository.findOneBy({ product: { id: product.id } });
        expect(skuInDb.quantity).toBe(50);
      });

      it('인증 토큰 없이 요청 시 401 Unauthorized를 반환해야 한다', () => {
        // given
        const stockInDto: StockRequestDto = { productId: product.id, quantity: 10 };

        // when & then
        return request(app.getHttpServer()).post('/inventory/inbound').send(stockInDto).expect(401);
      });

      it('유효하지 않은 데이터로 요청 시 400 Bad Request를 반환해야 한다', () => {
        // given: quantity가 0 이하
        const invalidDto: StockRequestDto = { productId: product.id, quantity: 0 };

        // when & then
        return request(app.getHttpServer())
          .post('/inventory/inbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidDto)
          .expect(400);
      });

      it('존재하지 않는 제품 ID로 요청 시 404 Not Found를 반환해야 한다', () => {
        // given
        const stockInDto: StockRequestDto = { productId: 999, quantity: 10 };

        // when & then
        return request(app.getHttpServer())
          .post('/inventory/inbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(stockInDto)
          .expect(404);
      });
    });

    describe('/inventory/outbound (POST)', () => {
      // let stockOutDto: StockRequestDto; // 이 변수 타입을 변경하거나 새로 만듭니다.
      let outboundDto: OutboundRequestDto; // 새로운 DTO 타입으로 변경

      beforeEach(async () => {
        // 입고 로직은 그대로 둡니다.
        const stockInDto: StockRequestDto = {
          productId: product.id,
          quantity: 15,
          expirationDate: new Date('2026-01-01'),
        };
        await request(app.getHttpServer())
          .post('/inventory/inbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(stockInDto);

        // 출고 DTO에서 expirationDate를 제거합니다.
        outboundDto = {
          productId: product.id,
          quantity: 10,
        };
      });

      it('성공적으로 재고를 출고하고, 남은 재고가 정확해야 한다', async () => {
        // when

        await request(app.getHttpServer())
          .post('/inventory/outbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(outboundDto) // 수정된 DTO 사용
          .expect(200);

        // then

        const skuInDb = await skuRepository.findOneBy({ product: { id: product.id } });
        expect(skuInDb.quantity).toBe(5); // 15 - 10 = 5
      });

      it('동시에 여러 출고 요청이 발생해도 정확하게 재고를 차감해야 한다 (Race Condition 테스트)', async () => {
        // given
        const request1 = request(app.getHttpServer())
          .post('/inventory/outbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ...outboundDto, quantity: 10 }); // 10개 출고

        const request2 = request(app.getHttpServer())
          .post('/inventory/outbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ...outboundDto, quantity: 5 }); // 5개 출고

        // when
        await Promise.all([request1, request2]);

        // then
        const skuInDb = await skuRepository.findOneBy({ product: { id: product.id } });
        expect(skuInDb.quantity).toBe(0); // 15 - 10 - 5 = 0
      });

      it('재고 부족 시 동시 요청 중 하나는 실패해야 한다 (Race Condition 테스트)', async () => {
        // ...
        const request1 = request(app.getHttpServer())
          .post('/inventory/outbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ...outboundDto, quantity: 10 }); // 10개 출고 요청

        const request2 = request(app.getHttpServer())
          .post('/inventory/outbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ ...outboundDto, quantity: 8 }); // 8개 출고 요청

        const [response1, response2] = await Promise.all([request1, request2]);

        const statuses = [response1.status, response2.status].sort();
        expect(statuses).toEqual([200, 400]);

        const skuInDb = await skuRepository.findOneBy({ product: { id: product.id } });
        expect([5, 7]).toContain(skuInDb.quantity); // 성공한 요청에 따라 5 또는 7이 남음
      });
    });
  });
  describe('GET inventory', () => {
    beforeAll(async () => {
      await stockHistoryRepository.clear();
      await skuRepository.clear();
      await productRepository.clear();
      const products = await createTestProduct(app, accessToken, 5);
      await createTestSku(app, accessToken, products, { datedCount: 45, nullExpirationCount: 5 });
    });

    afterAll(async () => {
      await stockHistoryRepository.clear();
      await skuRepository.clear();
      await productRepository.clear();
    });
    it('기본 옵션으로 재고 목록을 성공적으로 조회해야 한다', async () => {
      // when
      const response = await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.total).toBe(50);
      expect(response.body.items).toHaveLength(10);
    });

    it('offset과 limit을 지정하여 재고 목록을 성공적으로 조회해야 한다', async () => {
      // when
      const response = await request(app.getHttpServer())
        .get('/inventory?offset=45&limit=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // then
      expect(response.body.total).toBe(50);
      expect(response.body.items).toHaveLength(5);
    });

    it('유통기한이 없는(NULL) 재고가 먼저, 그 다음 유통기한이 긴 순서로 정렬되어야 한다', async () => {
      // when
      const response = await request(app.getHttpServer())
        .get('/inventory?limit=50') // 모든 데이터
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // then
      const { items } = response.body;
      expect(items).toHaveLength(50);

      const nullItems = items.slice(0, 5);
      const datedItems = items.slice(5);

      expect(nullItems.every((item) => item.expirationDate === null)).toBe(true);
      expect(datedItems.every((item) => item.expirationDate !== null)).toBe(true);

      // 유통기한 내림차순 정렬 확인
      for (let i = 0; i < datedItems.length - 1; i++) {
        const current = new Date(datedItems[i].expirationDate);
        const next = new Date(datedItems[i + 1].expirationDate);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    it('인증 토큰 없이 요청 시 401 Unauthorized를 반환해야 한다', () => {
      // when & then
      return request(app.getHttpServer()).get('/inventory').expect(401);
    });
  });

  describe('GET /inventory/:productId/history', () => {
    let product: ProductEntity;

    // 테스트를 위한 제품 1개, SKU 1개, 히스토리 7개 생성
    beforeAll(async () => {
      await stockHistoryRepository.clear();
      await skuRepository.clear();
      await productRepository.clear();

      product = (await createTestProduct(app, accessToken, 1))[0];

      // 입고 1번
      await request(app.getHttpServer())
        .post('/inventory/inbound')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ productId: product.id, quantity: 100 });

      // 출고 6번
      for (let i = 0; i < 6; i++) {
        await request(app.getHttpServer())
          .post('/inventory/outbound')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ productId: product.id, quantity: 10 });
      }
    });

    it('성공적으로 히스토리를 페이지네이션하여 조회해야 한다', async () => {
      // when: 2페이지 조회 (limit=3)
      const response = await request(app.getHttpServer())
        // highlight-start
        .get(`/inventory/${product.id}/history?offset=3&limit=3`)
        // highlight-end
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // then
      expect(response.body.total).toBe(7); // 총 히스토리 7개 (입고1 + 출고6)
      expect(response.body.items).toHaveLength(3);
      expect(response.body.items[0].type).toBe('OUTBOUND'); // 최신순이므로 출고가 먼저
    });

    it('존재하지 않는 SKU ID로 요청 시 404 Not Found를 반환해야 한다', async () => {
      await request(app.getHttpServer())
        .get('/inventory/99999/history')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
