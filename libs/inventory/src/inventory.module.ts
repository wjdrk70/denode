import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StorageModule } from '@app/storage';
import { ProductModule } from '@app/product';
import { TransactionModule } from '@app/transaction';

@Module({
  imports: [StorageModule, ProductModule, TransactionModule],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
