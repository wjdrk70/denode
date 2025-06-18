import { CustomException } from '@app/exception/custom.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class SkuNotFoundException extends CustomException {
  constructor() {
    super(ErrorCode.SKU_NOT_FOUND, HttpStatus.NOT_FOUND, 'SKU를 찾을 수 없습니다.');
  }
}
