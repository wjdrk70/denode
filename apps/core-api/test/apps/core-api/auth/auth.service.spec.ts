import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@api/auth/auth.service';
import { UserRepository, USER_REPOSITORY } from '@app/domain/user/user.repository';
import { User } from '@app/domain/user/user';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
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
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp (회원가입)', () => {
    const signUpDto = { email: 'test@example.com', password: 'password123' };

    it('이미 존재하는 이메일로 가입 시 ConflictException을 던져야 한다', async () => {
      // given
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(new User(signUpDto));

      // when & then
      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException);
    });

    it('성공적으로 새로운 유저를 생성하고, 비밀번호는 해싱되어야 한다', async () => {
      // given
      const hashedPassword = 'hashed_password';
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.save as jest.Mock).mockImplementation(async (user) => new User({ id: 1, ...user }));

      // when
      const result = await service.signUp(signUpDto);

      // then
      expect(result.password).toEqual(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: hashedPassword }));
    });
  });
});
