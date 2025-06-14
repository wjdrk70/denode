import { Module } from '@nestjs/common';
import { CoreApiController } from './core-api.controller';
import { CoreApiService } from './core-api.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CoreApiController],
  providers: [CoreApiService],
})
export class CoreApiModule {}
