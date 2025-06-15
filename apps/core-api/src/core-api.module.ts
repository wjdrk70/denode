import { Module } from '@nestjs/common';
import { CoreApiController } from './core-api.controller';
import { CoreApiService } from './core-api.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/storage/entities/user.entity';
import * as process from 'node:process';

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
        entities: [UserEntity],
        synchronize: false,
        logger: 'advanced-console',
        logging: ['query', 'error', 'schema', 'warn'],
      }),
    }),
    AuthModule,
  ],
  controllers: [CoreApiController],
  providers: [CoreApiService],
})
export class CoreApiModule {}
