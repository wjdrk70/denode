import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@app/user/domain/user';

import { UserService } from '@app/user';
import { InvalidCredentialsException } from '@app/auth/support/exception/invalid-credentials.exception';

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
      throw new InvalidCredentialsException();
    }

    const passwordEqual = await bcrypt.compare(dto.password, user.password);
    if (!passwordEqual) {
      throw new InvalidCredentialsException();
    }
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
