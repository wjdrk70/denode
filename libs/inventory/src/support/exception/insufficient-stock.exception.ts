import { CustomException } from '@app/exception/custom.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends CustomException {
  constructor() {
    super(ErrorCode.INSUFFICIENT_STOCK, HttpStatus.BAD_REQUEST, '재고가 충분하지 않습니다.');
  }
}
