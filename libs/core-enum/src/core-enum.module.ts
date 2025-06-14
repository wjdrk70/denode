import { Module } from '@nestjs/common';
import { CoreEnumService } from './core-enum.service';

@Module({
  providers: [CoreEnumService],
  exports: [CoreEnumService],
})
export class CoreEnumModule {}
