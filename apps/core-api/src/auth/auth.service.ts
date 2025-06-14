import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '@app/domain/user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from '@app/domain/user/user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: { email: string; password: string }): Promise<User> {
    const existUser = await this.userRepository.findByEmail(dto.email);
    if (existUser) {
      throw new ConflictException('이미 사용중인 이메일 입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = new User({ email: dto.email, password: hashedPassword });

    return this.userRepository.save(newUser);
  }
}
