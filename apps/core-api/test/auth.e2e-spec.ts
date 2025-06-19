import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from '@app/storage/entity/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { createTestApp } from './test-data.setup';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    app = await createTestApp();

    userRepository = app.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));

    await app.init();
  });

  afterAll(async () => {
    await userRepository.clear();
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    const signUpDto = { email: 'test@example.com', password: 'password123' };

    it('성공적으로 회원가입을 하고 201 Created를 반환해야 한다', async () => {
      // act
      await request(app.getHttpServer()).post('/auth/signup').send(signUpDto).expect(201); // Assert: 상태 코드를 검증합니다.

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
