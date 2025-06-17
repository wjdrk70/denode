import { TransactionAction } from '@app/transaction/transaction-action';

export const TRANSACTION_HANDLER = Symbol('TRANSACTION_HANDLER');

export interface TransactionHandler {
  run<T>(action: TransactionAction<T>): Promise<T>;
}
