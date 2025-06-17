import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from '@app/user/domain/user.repository';
import { PRODUCT_REPOSITORY } from '@app/product/domain/product.repository';
import { UserEntity } from '@app/storage/entity/user.entity';
import { UserOrmRepository } from '@app/storage/repository/user.orm.repository';
import { ProductOrmRepository } from '@app/storage/repository/product.orm.repository';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';
import { TRANSACTION_HANDLER } from '@app/transaction/transaction-handler';
import { TransactionContextManager } from '@app/storage/transaction/transaction-context-manager';
import { TypeormTransactionHandler } from '@app/storage/transaction/typeorm-transaction-handler';
import { SKU_REPOSITORY } from '@app/inventory/domain/sku.repository';
import { SkuOrmRepository } from '@app/storage/repository/sku.orm.repository';
import { STOCK_HISTORY_REPOSITORY } from '@app/inventory/domain/stock-history.repository';
import { StockHistoryOrmRepository } from '@app/storage/repository/stock-history.orm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProductEntity, SkuEntity, StockHistoryEntity])],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserOrmRepository },
    { provide: PRODUCT_REPOSITORY, useClass: ProductOrmRepository },
    { provide: SKU_REPOSITORY, useClass: SkuOrmRepository },
    { provide: STOCK_HISTORY_REPOSITORY, useClass: StockHistoryOrmRepository },
    { provide: TRANSACTION_HANDLER, useClass: TypeormTransactionHandler },
    TransactionContextManager,
  ],
  exports: [USER_REPOSITORY, PRODUCT_REPOSITORY, SKU_REPOSITORY, STOCK_HISTORY_REPOSITORY, TRANSACTION_HANDLER],
})
export class StorageModule {}
