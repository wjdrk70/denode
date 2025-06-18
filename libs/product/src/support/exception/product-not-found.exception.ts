import { CustomHttpException } from '@app/exception/custom-http.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class ProductNotFoundException extends CustomHttpException {
  constructor() {
    super(ErrorCode.PRODUCT_NOT_FOUND, '제품을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}
