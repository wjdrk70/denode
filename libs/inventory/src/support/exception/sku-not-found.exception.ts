import { CustomHttpException } from '@app/exception/custom-http.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class SkuNotFoundException extends CustomHttpException {
  constructor() {
    super(ErrorCode.SKU_NOT_FOUND, 'SKU를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}