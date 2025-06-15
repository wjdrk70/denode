import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/storage/entities/user.entity';
import { UserOrmRepository } from '@app/storage/repositories/user.orm.repository';
import { USER_REPOSITORY } from '@app/domain/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserOrmRepository, { provide: USER_REPOSITORY, useClass: UserOrmRepository }],
  exports: [USER_REPOSITORY],
})
export class StorageModule {}
