import * as process from 'node:process';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreApiController } from './core-api.controller';
import { CoreApiService } from './core-api.service';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from '@app/storage/entities/user.entity';
import { ProductEntity } from '@app/storage/entities/product.entity';
import { ProductModule } from './catalog/product.module';

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
        entities: [UserEntity, ProductEntity],
        synchronize: false,
        logger: 'advanced-console',
        logging: ['query', 'error', 'schema', 'warn'],
      }),
    }),
    AuthModule,
    ProductModule,
  ],
  controllers: [CoreApiController],
  providers: [CoreApiService],
})
export class CoreApiModule {}
