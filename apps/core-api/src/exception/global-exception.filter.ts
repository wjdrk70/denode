import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomException } from '@app/exception/custom.exception';

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  private getErrorDetails(error: any): { status: HttpStatus; message: string; errorCode: string } {
    const originalError = error.cause || error;

    if (originalError instanceof CustomException) {
      return {
        status: originalError.httpStatus,
        message: originalError.message,
        errorCode: originalError.errorCode,
      };
    }

    if (error instanceof HttpException) {
      const status = error.getStatus();
      const res = error.getResponse();
      const message = typeof res === 'string' ? res : (res as any).message;
      const errorCode = error.name.toUpperCase().replace(/EXCEPTION$/, '');
      return { status, message, errorCode };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '예상치 못한 오류가 발생했습니다. 관리자에게 문의해주세요.',
      errorCode: 'UNEXPECTED_ERROR',
    };
  }

  catch(error: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errorCode } = this.getErrorDetails(error);
    const originalError = error.cause || error;

    if (status >= 500) {
      this.logger.error(`[Error] ${message}`, {
        errorCode,
        statusCode: status,
        path: request.url,
        stack: originalError.stack,
      });
    } else {
      this.logger.warn(`[Warn] ${message}`, { errorCode, statusCode: status, path: request.url });
    }

    response.status(status).json({ statusCode: status, errorCode, message });
  }

  // catch(error: any, host: ArgumentsHost) {
  //   // --- 디버깅을 위한 코드 ---
  //   console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  //   console.error('!!     RAW ERROR OBJECT START     !!');
  //   console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  //
  //   console.error(error); // 여기서 실제 에러 객체 전체를 출력합니다.
  //
  //   console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  //   console.error('!!      RAW ERROR OBJECT END      !!');
  //   console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  //   // --- 디버깅 종료 ---
  //
  //   const ctx = host.switchToHttp();
  //   const response = ctx.getResponse<Response>();
  //
  //   // 클라이언트에게는 간단한 응답만 보냅니다.
  //   response.status(500).json({
  //     statusCode: 500,
  //     message: 'An internal server error occurred. Check the console logs for details.',
  //     error: 'Internal Server Error',
  //   });
  // }
}
