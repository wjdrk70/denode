import { CustomHttpException } from '@app/exception/custom-http.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends CustomHttpException {
  constructor() {
    super(ErrorCode.USER_ALREADY_EXISTS, '이미 사용중인 이메일 입니다.', HttpStatus.CONFLICT);
  }
}
