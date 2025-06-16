import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from '@app/domain/user/user.repository';
import { PRODUCT_REPOSITORY } from '@app/domain/catalog/product.repository';
import { UserEntity } from '@app/storage/entities/user.entity';
import { UserOrmRepository } from '@app/storage/repositories/user.orm.repository';
import { ProductOrmRepository } from '@app/storage/repositories/product.orm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserOrmRepository },
    { provide: PRODUCT_REPOSITORY, useClass: ProductOrmRepository },
  ],
  exports: [USER_REPOSITORY, PRODUCT_REPOSITORY],
})
export class StorageModule {}
