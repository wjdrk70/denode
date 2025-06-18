import { CustomHttpException } from '@app/exception/custom-http.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class InvalidStockQuantityException extends CustomHttpException {
  constructor() {
    super(ErrorCode.INVALID_STOCK_QUANTITY, '수량은 1 이상 이어야 합니다.', HttpStatus.BAD_REQUEST);
  }
}
