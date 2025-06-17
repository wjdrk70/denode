import { Injectable } from '@nestjs/common';
import { TransactionHandler } from '@app/transaction/transaction-handler';
import { TransactionAction } from '@app/transaction/transaction-action';
import { DataSource } from 'typeorm';
import { TransactionContextManager } from '@app/storage/transaction/transaction-context-manager';

@Injectable()
export class TypeormTransactionHandler implements TransactionHandler {
  constructor(
    private readonly dataSource: DataSource,
    private readonly contextManager: TransactionContextManager,
  ) {}

  async run<T>(action: TransactionAction<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      return this.contextManager.runWithContext(manager, action);
    });
  }
}
