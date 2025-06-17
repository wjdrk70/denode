import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/storage/entity/user.entity';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreApiModule } from '@api/core-api.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateProductDto } from '@app/product/dto/create-product.dto';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let productRepository: Repository<ProductEntity>;
  let accessToken: string;

  const userCredentials = { email: 'test2@example.com', password: 'password123' };

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

    await app.init();

    // E2E 테스트를 위한 사용자 생성 및 로그인
    await request(app.getHttpServer()).post('/auth/signup').send(userCredentials);
    const loginResponse = await request(app.getHttpServer()).post('/auth/signin').send(userCredentials);
    accessToken = loginResponse.body.accessToken;
  });

  beforeEach(async () => {
    // 각 테스트 실행 전 product 테이블 초기화
    await productRepository.clear();
    await userRepository.clear();

    await app.init();

    // E2E 테스트를 위한 사용자 생성 및 로그인
    await request(app.getHttpServer()).post('/auth/signup').send(userCredentials);
    const loginResponse = await request(app.getHttpServer()).post('/auth/signin').send(userCredentials);
    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/product (POST)', () => {
    const createProductDto: CreateProductDto = {
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
