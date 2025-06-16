import { UserEntity } from '@app/storage/entities/user.entity';
import { User } from '@app/user/domain/user';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return new User({
      id: entity.id,
      email: entity.email,
      password: entity.password,
    });
  }

  static toEntity(domain: User): UserEntity {
    const entity = new UserEntity();

    entity.id = domain.id;
    entity.email = domain.email;
    entity.password = domain.password;
    return entity;
  }
}
