import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreApiModule } from '@api/core-api.module';
import { ProductEntity } from '@app/storage/entity/product.entity';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [CoreApiModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // 모든 E2E 테스트에 동일한 전역 파이프 적용
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

export async function createTestUserAndLogin(app: INestApplication, credentials: { email: string; password: string }) {
  await request(app.getHttpServer()).post('/auth/signup').send(credentials);
  const response = await request(app.getHttpServer()).post('/auth/signin').send(credentials);
  return {
    accessToken: response.body.accessToken,
  };
}

export async function createTestProduct(app: INestApplication, token: string, count: number) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const response = await request(app.getHttpServer())
      .post('/product')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: `Test Product ${i + 1}`, description: `desc ${i}` });
    products.push(response.body);
  }
  return products;
}

export async function createTestSku(
  app: INestApplication,
  token: string,
  products: ProductEntity[],
  options: { datedCount: number; nullExpirationCount: number },
) {
  // 유통기한 있는 SKU 생성
  for (let i = 0; i < options.datedCount; i++) {
    const day = String((i % 28) + 1).padStart(2, '0');
    const month = String((Math.floor(i / 28) % 12) + 1).padStart(2, '0');
    const expirationDate = new Date(`2027-${month}-${day}`);
    await request(app.getHttpServer())
      .post('/inventory/inbound')
      .set('Authorization', `Bearer ${token}`)
      .send({
        // 제품을 순환하며 사용
        productId: products[i % products.length].id,
        quantity: 10,
        expirationDate,
      });
  }

  // 유통기한 없는 SKU 생성
  // 유니크 제약조건(productId, expirationDate) 때문에 각기 다른 제품에 할당해야 함
  if (options.nullExpirationCount > products.length) {
    throw new Error('유통기한 없는 SKU를 생성하려면 제품의 수가 더 많아야 합니다.');
  }
  for (let i = 0; i < options.nullExpirationCount; i++) {
    await request(app.getHttpServer()).post('/inventory/inbound').set('Authorization', `Bearer ${token}`).send({
      productId: products[i].id, // 다른 제품 ID 사용
      quantity: 5,
    });
  }
}
