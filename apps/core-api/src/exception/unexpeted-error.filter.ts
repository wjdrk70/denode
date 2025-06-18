import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class UnexpectedErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnexpectedErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = '예상치 못한 오류가 발생했습니다. 관리자에게 문의해주세요.';

    this.logger.error({
      message: `[UnexpectedError] ${(exception as any).message}`,
      path: request.url,
      stack: (exception as Error).stack,
    });

    response.status(status).json({
      statusCode: status,
      errorCode: 'UNEXPECTED_ERROR',
      message,
    });
  }
}
