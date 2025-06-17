import { Module } from '@nestjs/common';

@Module({})
export class TransactionModule {
  static forRoot() {
    return {
      module: TransactionModule,
      global: true,
    };
  }
}
