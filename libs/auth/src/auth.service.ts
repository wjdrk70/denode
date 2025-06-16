import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@app/user/domain/user';

import { UserService } from '@app/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: { email: string; password: string }): Promise<User> {
    return this.userService.createUser(dto);
  }

  async signIn(dto: { email: string; password: string }): Promise<{ accessToken: string }> {
    const user = await this.userService.findOneByEmail(dto.email);
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
