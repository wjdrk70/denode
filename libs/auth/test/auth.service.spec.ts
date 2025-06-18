import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { User } from '@app/user/domain/user';
import { UserService } from '@app/user';
import { createMock } from '@golevelup/ts-jest';
import { InvalidCredentialsException } from '@app/auth/support/exception/invalid-credentials.exception';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // AuthService의 signUp은 이제 UserService.createUser를 호출하기만 합니다.
  describe('signUp', () => {
    const signUpDto = { email: 'test@example.com', password: 'password123' };

    it('회원가입이 성공적으로 되어야한다', async () => {
      // given
      const user = new User({ ...signUpDto, id: 1 });
      userService.createUser.mockResolvedValue(user);

      // when
      const result = await service.signUp(signUpDto);

      // then
      expect(userService.createUser).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual(user);
    });
  });

  describe('signIn', () => {
    const signInDto = { email: 'test@example.com', password: 'password123' };
    const user = new User({ id: 1, email: signInDto.email, password: 'hashed_password' });

    it('가입되지 않은 이메일로 로그인 시 UnauthorizedException을 던져야 한다', async () => {
      // given
      userService.findOneByEmail.mockResolvedValue(null);

      // when & then
      await expect(service.signIn(signInDto)).rejects.toThrow(InvalidCredentialsException);
    });

    it('비밀번호가 틀렸을 경우 UnauthorizedException을 던져야 한다', async () => {
      // given
      userService.findOneByEmail.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // when & then
      await expect(service.signIn(signInDto)).rejects.toThrow(InvalidCredentialsException);
    });

    it('로그인에 성공하면 accessToken을 반환해야 한다', async () => {
      // given
      const accessToken = 'test_access_token';
      userService.findOneByEmail.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(accessToken);

      // when
      const result = await service.signIn(signInDto);

      // then
      expect(userService.findOneByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(signInDto.password, user.password);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ accessToken });
    });
  });
});
