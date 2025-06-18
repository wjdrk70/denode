import { CustomException } from '@app/exception/custom.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class ProductAlreadyExistsException extends CustomException {
  constructor() {
    super(ErrorCode.PRODUCT_ALREADY_EXISTS, HttpStatus.CONFLICT, '이미 존재하는 제품 이름입니다.');
  }
}
