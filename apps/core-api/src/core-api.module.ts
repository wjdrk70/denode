import * as process from 'node:process';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreApiController } from '@api/controller/core-api.controller';
import { CoreApiService } from './core-api.service';
import { AuthModule } from '@app/auth/auth.module';
import { UserEntity } from '@app/storage/entity/user.entity';
import { ProductEntity } from '@app/storage/entity/product.entity';
import { InventoryModule } from '@app/inventory';
import { SkuEntity } from '@app/storage/entity/sku.entity';
import { StockHistoryEntity } from '@app/storage/entity/stock-history.entity';
import { TransactionModule } from '@app/transaction';
import { AuthController } from '@api/controller/auth.controller';
import { ProductController } from '@api/controller/product.controller';
import { InventoryController } from '@api/controller/inventory.controller';
import { ProductModule } from '@app/product';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [UserEntity, ProductEntity, SkuEntity, StockHistoryEntity],
        synchronize: false,
        logger: 'advanced-console',
        logging: ['query', 'error', 'schema', 'warn'],
        timezone: 'Z',
      }),
    }),
    AuthModule,
    ProductModule,
    InventoryModule,
    TransactionModule,
  ],
  controllers: [CoreApiController, AuthController, ProductController, InventoryController],
  providers: [CoreApiService],
})
export class CoreApiModule {}
