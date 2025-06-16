import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { StorageModule } from '@app/storage';
import { AuthModule } from '@api/auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
