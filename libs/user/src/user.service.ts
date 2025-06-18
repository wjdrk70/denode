import * as bcrypt from 'bcrypt';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '@app/user/domain/user.repository';
import { User } from '@app/user/domain/user';
import { UserAlreadyExistsException } from '@app/user/support/exception/user-already-exists.exception';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async createUser(dto: { email: string; password: string }): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = User.create({ email: dto.email, password: hashedPassword });
    return this.userRepository.save(newUser);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findByEmail(email);
  }
}
