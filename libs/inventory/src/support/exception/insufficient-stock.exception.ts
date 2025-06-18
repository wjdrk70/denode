import { CustomHttpException } from '@app/exception/custom-http.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends CustomHttpException {
  constructor() {
    super(ErrorCode.INSUFFICIENT_STOCK, '재고가 충분하지 않습니다.', HttpStatus.BAD_REQUEST);
  }
}