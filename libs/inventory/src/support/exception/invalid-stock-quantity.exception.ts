import { CustomException } from '@app/exception/custom.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class InvalidStockQuantityException extends CustomException {
  constructor() {
    super(ErrorCode.INVALID_STOCK_QUANTITY, HttpStatus.BAD_REQUEST, '수량은 1 이상 이어야 합니다.');
  }
}
