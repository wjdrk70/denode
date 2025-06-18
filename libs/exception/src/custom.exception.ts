import { HttpStatus } from '@nestjs/common';

export abstract class CustomException extends Error {
  public readonly _isCustomException = true;

  protected constructor(
    public readonly errorCode: string,
    public readonly httpStatus: HttpStatus,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
