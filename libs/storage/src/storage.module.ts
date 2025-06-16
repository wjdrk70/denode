import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from '@app/user/domain/user.repository';
import { PRODUCT_REPOSITORY } from '@app/product/domain/product.repository';
import { UserEntity } from '@app/storage/entity/user.entity';
import { UserOrmRepository } from '@app/storage/repository/user.orm.repository';
import { ProductOrmRepository } from '@app/storage/repository/product.orm.repository';
import { ProductEntity } from '@app/storage/entity/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProductEntity])],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserOrmRepository },
    { provide: PRODUCT_REPOSITORY, useClass: ProductOrmRepository },
  ],
  exports: [USER_REPOSITORY, PRODUCT_REPOSITORY],
})
export class StorageModule {}
