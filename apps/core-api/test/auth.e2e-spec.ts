import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/storage/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { CoreApiModule } from '@api/core-api.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;

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

    await app.init();
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    const signUpDto = { email: 'test@example.com', password: 'password123' };

    it('성공적으로 회원가입을 하고 201 Created를 반환해야 한다', async () => {
      // act
      const response = await request(app.getHttpServer()).post('/auth/signup').send(signUpDto).expect(201); // Assert: 상태 코드를 검증합니다.

      // assert
      const userInDb = await userRepository.findOneBy({ email: signUpDto.email });
      expect(userInDb).toBeDefined();
      expect(userInDb.email).toEqual(signUpDto.email);

      expect(userInDb.password).not.toEqual(signUpDto.password);
    });

    it('이미 존재하는 이메일로 가입 시 409 Conflict를 반환해야 한다', async () => {
      // arange
      await request(app.getHttpServer()).post('/auth/signup').send(signUpDto);

      // act & assert.
      return request(app.getHttpServer()).post('/auth/signup').send(signUpDto).expect(409);
    });
  });

  describe('/auth/signin (POST)', () => {
    const userCredentials = { email: 'test@example.com', password: 'password123' };

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/signup').send(userCredentials);
    });

    it('올바른 정보로 로그인 시 액세스 토큰과 함께 200 OK를 반환해야 한다', async () => {
      // act
      const response = await request(app.getHttpServer()).post('/auth/signin').send(userCredentials).expect(200);

      // assert
      expect(response.body.accessToken).toBeDefined();
    });

    it('틀린 비밀번호로 로그인 시 401 Unauthorized를 반환해야 한다', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({ ...userCredentials, password: 'wrong_password' })
        .expect(401);
    });
  });
});
