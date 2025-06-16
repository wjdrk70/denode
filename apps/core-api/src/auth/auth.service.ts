import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

    const newUser = User.create({ email: dto.email, password: hashedPassword });

    return this.userRepository.save(newUser);
  }

  async signIn(dto: { email: string; password: string }): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const passwordEqual = await bcrypt.compare(dto.password, user.password);
    if (!passwordEqual) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
