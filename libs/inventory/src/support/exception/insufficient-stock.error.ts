import { CustomDomainException } from '@app/exception/custom-domain.exception';

export class InsufficientStockError extends CustomDomainException {
  constructor() {
    super(`재고가 부족합니다.`);
  }
}
