import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  readonly errorCode: string;

  constructor(errorCode: string, message: string, status: HttpStatus) {
    super(message, status);
    this.errorCode = errorCode;
  }
}
