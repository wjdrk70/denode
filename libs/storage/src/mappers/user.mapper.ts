import { UserEntity } from '@app/storage/entities/user.entity';
import { User } from '@app/domain/user/user';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return User.create({
      id: entity.id,
      email: entity.email,
      password: entity.password,
    });
  }

  static toEntity(domain: User): UserEntity {
    const entity = new UserEntity();

    if (domain.id) {
      entity.id = domain.id;
    }
    entity.email = domain.email;
    entity.password = domain.password;
    return entity;
  }
}
