import { CustomDomainException } from '@app/exception/custom-domain.exception';

export class InvalidStockQuantityError extends CustomDomainException {
  constructor() {
    super('수량은 1 이상 이어야 합니다');
  }
}