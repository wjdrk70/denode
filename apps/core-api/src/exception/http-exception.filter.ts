import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpException } from '@app/exception/custom-http.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    let errorCode: string;
    let message: string;

    if (exception instanceof CustomHttpException) {
      errorCode = exception.errorCode;
      message = exception.message;
    } else {
      errorCode = exception.constructor.name;
      const response = exception.getResponse();
      message = typeof response === 'string' ? response : (response as any).message;
    }

    this.logger.log({
      // 일반적인 HTTP 예외는 warn 또는 log 레벨로 기록
      message: `[HttpException] ${message}`,
      errorCode,
      statusCode: status,
      path: request.url,
    });

    response.status(status).json({
      statusCode: status,
      errorCode,
      message,
    });
  }
}
