import * as bcrypt from 'bcrypt';
import { UserService } from '@app/user';
import { USER_REPOSITORY, UserRepository } from '@app/user/domain/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { User } from '@app/user/domain/user';
import { createMock } from '@golevelup/ts-jest';

jest.mock('bcrypt');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: jest.Mocked<UserService>;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: createMock<UserRepository>(),
        },
      ],
    }).compile();

    service = module.get(UserService);
    userRepository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const hashedPassword = 'hashedPassword';

    it('새로운 유저를 성공적으로 생성해야 한다', async () => {
      // given
      userRepository.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      userRepository.save.mockImplementation((user: User) => Promise.resolve(new User({ ...user, id: 1 })));

      // when
      const result = await service.createUser(createUserDto);

      // then
      expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createUserDto.email,
          password: hashedPassword,
        }),
      );
      expect(result.id).toBe(1);
      expect(result.email).toBe(createUserDto.email);
    });

    it('이미 존재하는 이메일로 생성 시 ConflictException을 던져야 한다', async () => {
      // given
      userRepository.findByEmail.mockResolvedValue(new User({ ...createUserDto, id: 1 }));

      // when & then
      await expect(service.createUser(createUserDto)).rejects.toThrow(
        new ConflictException('이미 사용중인 이메일 입니다.'),
      );
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOneByEmail', () => {
    it('이메일로 유저를 찾아 반환해야 한다', async () => {
      // given
      const email = 'test@example.com';
      const user = new User({
        id: 1,
        email,
        password: 'hashedPassword',
      });
      userRepository.findByEmail.mockResolvedValue(user);

      // when
      const result = await service.findOneByEmail(email);

      // then
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(user);
    });

    it('유저를 찾지 못하면 undefined를 반환해야 한다', async () => {
      // given
      const email = 'notfound@example.com';
      userRepository.findByEmail.mockResolvedValue(undefined);

      // when
      const result = await service.findOneByEmail(email);

      // then
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeUndefined();
    });
  });
});
