export interface TransactionAction<T = void> {
  (): Promise<T>;
}
