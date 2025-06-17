import { User } from '@app/user/domain/user';

export const USER_REPOSITORY = Symbol.for('USER_REPOSITORY');

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;

  save(user: User): Promise<User>;
}
