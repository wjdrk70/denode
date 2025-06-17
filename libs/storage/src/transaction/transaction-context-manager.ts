import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionAction } from '@app/transaction/transaction-action';

@Injectable()
export class TransactionContextManager {
  private readonly asyncLocalStorage = new AsyncLocalStorage<EntityManager>();

  async runWithContext<T>(entityManager: EntityManager, action: TransactionAction<T>): Promise<T> {
    return this.asyncLocalStorage.run(entityManager, action);
  }

  getCurrentEntityManager(): EntityManager | undefined {
    return this.asyncLocalStorage.getStore();
  }

  isInTransaction(): boolean {
    return this.getCurrentEntityManager() !== undefined;
  }
}
