import { CustomHttpException } from '@app/exception/custom-http.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends CustomHttpException {
  constructor() {
    super(ErrorCode.INVALID_CREDENTIALS, '이메일 또는 비밀번호가 올바르지 않습니다.', HttpStatus.UNAUTHORIZED);
  }
}
