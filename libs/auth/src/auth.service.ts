import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@app/user/domain/user';

import { UserService } from '@app/user';
import { InvalidCredentialsException } from '@app/auth/support/exception/invalid-credentials.exception';
import { AuthCredentialRequestDto } from '@app/auth/dto/request/auth-credential-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: AuthCredentialRequestDto): Promise<User> {
    return this.userService.createUser(dto);
  }

  async signIn(dto: AuthCredentialRequestDto): Promise<string> {
    const user = await this.userService.findOneByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordEqual = await bcrypt.compare(dto.password, user.password);
    if (!passwordEqual) {
      throw new InvalidCredentialsException();
    }
    const payload = { sub: user.id, email: user.email };

    return this.jwtService.sign(payload);
  }
}
