import { UserRepository } from '@app/user/domain/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/storage/entities/user.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '@app/user/domain/user';
import { UserMapper } from '@app/storage/mappers/user.mapper';

@Injectable()
export class UserOrmRepository implements UserRepository {
  constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {}

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOneBy({ email });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<User> {
    const entity = UserMapper.toEntity(user);
    const saveEntity = await this.repository.save(entity);

    return UserMapper.toDomain(saveEntity);
  }
}
