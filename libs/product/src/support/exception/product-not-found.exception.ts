import { CustomException } from '@app/exception/custom.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends CustomException {
  constructor() {
    super(ErrorCode.PRODUCT_NOT_FOUND, HttpStatus.NOT_FOUND, '제품을 찾을 수 없습니다.');
  }
}
