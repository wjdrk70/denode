import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpException } from '@app/exception/custom-http.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, errorCode, message } = this.extractExceptionDetails(exception);

    // 로그 기록
    const log = {
      message,
      errorCode,
      statusCode,
      path: request.url,
      stack: (exception as Error).stack,
    };
    this.logger.error(log);

    // 클라이언트 응답
    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
    });
  }

  private extractExceptionDetails(exception: unknown): {
    statusCode: number;
    errorCode: string;
    message: string;
  } {
    if (exception instanceof CustomHttpException) {
      return {
        statusCode: exception.getStatus(),
        errorCode: exception.errorCode,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        errorCode: 'HttpException', // 일반 HttpException은 별도 코드가 없음
        message: (exception.getResponse() as any).message || exception.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: 'UNEXPECTED_ERROR',
      message: '예상치 못한 오류가 발생했습니다. 관리자에게 문의해주세요.',
    };
  }
}
