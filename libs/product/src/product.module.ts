import { Module } from '@nestjs/common';
import { ProductController } from '@api/contorller/product.controller';
import { ProductService } from './product.service';
import { StorageModule } from '@app/storage';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
