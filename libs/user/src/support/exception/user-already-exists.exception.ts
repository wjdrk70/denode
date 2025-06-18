import { CustomException } from '@app/exception/custom.exception';
import { ErrorCode } from '@app/exception/error.code';
import { HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends CustomException {
  constructor() {
    super(ErrorCode.USER_ALREADY_EXISTS, HttpStatus.CONFLICT, '이미 사용중인 이메일 입니다.');
  }
}
