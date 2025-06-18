import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ProductModule } from '@app/product';
import { TransactionModule } from '@app/transaction';

@Module({
  imports: [ProductModule, TransactionModule],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
