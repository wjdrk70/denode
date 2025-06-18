import { CustomException } from '@app/exception/custom.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends CustomException {
  constructor() {
    super(ErrorCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED, '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
}
