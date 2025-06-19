import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/storage/entity/user.entity';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductRequestDto } from '@app/product/dto/request/create-product-request.dto';
import { createTestApp, createTestUserAndLogin } from './test-data.setup';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let productRepository: Repository<ProductEntity>;
  let userRepository: Repository<UserEntity>;
  let accessToken: string;
  const createdProductIds: number[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    productRepository = app.get(getRepositoryToken(ProductEntity));
    userRepository = app.get(getRepositoryToken(UserEntity));
    accessToken = (
      await createTestUserAndLogin(app, {
        email: 'product-e2e@test.com',
        password: 'password123',
      })
    ).accessToken;
  });

  afterEach(async () => {
    if (createdProductIds.length > 0) {
      await productRepository.delete(createdProductIds);
      createdProductIds.length = 0; // 배열 비우기
    }
  });

  afterAll(async () => {
    await userRepository.clear(); // 이 테스트 파일에서 만든 user 정리
    await app.close();
  });

  describe('/product (POST)', () => {
    const createProductDto: CreateProductRequestDto = {
      name: '초코에몽 190ml * 10',
      description: '초코에몽 190ml unit 1',
    };

    it('인증 토큰 없이 요청 시 401 Unauthorized를 반환해야 한다', () => {
      return request(app.getHttpServer()).post('/product').send(createProductDto).expect(401);
    });

    it('유효하지 않은 데이터로 요청 시 400 Bad Request를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ description: '이름 없는 제품' }) // name 필드 누락
        .expect(400);
    });

    it('성공적으로 제품을 생성하고 201 Created를 반환해야 한다', async () => {
      // act
      const response = await request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createProductDto)
        .expect(201);

      // assert
      expect(response.body.name).toEqual(createProductDto.name);
      const productInDb = await productRepository.findOneBy({
        name: createProductDto.name,
      });
      expect(productInDb).toBeDefined();
      expect(productInDb.description).toEqual(createProductDto.description);
    });

    it('이미 존재하는 이름으로 제품 생성 시 409 Conflict를 반환해야 한다', async () => {
      // arrange
      await request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createProductDto);

      // act & assert
      return request(app.getHttpServer())
        .post('/product')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createProductDto)
        .expect(409);
    });
  });
});
