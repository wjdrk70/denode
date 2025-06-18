import { CustomHttpException } from '@app/exception/custom-http.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class ProductAlreadyExistsException extends CustomHttpException {
  constructor() {
    super(ErrorCode.PRODUCT_ALREADY_EXISTS, '이미 존재하는 제품 이름입니다.', HttpStatus.CONFLICT);
  }
}
