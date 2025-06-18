import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { StorageModule } from '@app/storage';

@Module({
  imports: [StorageModule],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
