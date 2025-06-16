import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@app/auth/auth.service';
import { UserRepository, USER_REPOSITORY } from '@app/user/domain/user.repository';
import { User } from '@app/user/domain/user';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },

        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('회원가입', () => {
    const signUpDto = { email: 'test@example.com', password: 'password123' };

    it('이미 존재하는 이메일로 가입 시 ConflictException을 던져야 한다', async () => {
      // given
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(User.create({ ...signUpDto }));

      // when & then
      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });

    it('성공적으로 새로운 유저를 생성하고, 비밀번호는 해싱되어야 한다', async () => {
      // given
      const hashedPassword = 'hashed_password';
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.save as jest.Mock).mockImplementation(async (user) =>
        User.create({
          email: signUpDto.email,
          password: hashedPassword,
        }),
      );

      // when
      const result = await service.signUp(signUpDto);

      // then
      expect(result.password).toEqual(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: hashedPassword }));
    });
  });

  describe('로그인', () => {
    const signInDto = { email: 'test@example.com', password: 'password123' };
    const hashedPassword = 'hashed_password';
    const user = User.create({ email: signInDto.email, password: hashedPassword });

    it('가입되지 않은 이메일로 로그인 시 UnauthorizedException을 던져야 한다', async () => {
      // given
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      // when & then
      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호가 틀렸을 경우 UnauthorizedException을 던져야 한다', async () => {
      // given
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // when & then
      await expect(service.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('이메일과 비밀번호가 모두 일치하면 액세스 토큰을 반환해야 한다', async () => {
      // given
      const accessToken = 'test_access_token';
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(accessToken);

      // when
      const result = await service.signIn(signInDto);

      // then
      expect(userRepository.findByEmail).toHaveBeenCalledWith(signInDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(signInDto.password, hashedPassword);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ accessToken });
    });
  });
});
