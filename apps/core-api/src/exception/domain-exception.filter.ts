import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { CustomDomainException } from '@app/exception/custom-domain.exception';
import { CustomHttpException } from '@app/exception/custom-http.exception';
import { InsufficientStockError } from '@app/inventory/support/exception/insufficient-stock.error';
import { InsufficientStockException } from '@app/inventory/support/exception/insufficient-stock.exception';
import { InvalidStockQuantityError } from '@app/inventory/support/exception/invalid-stock-quantity.error';
import { InvalidStockQuantityException } from '@app/inventory/support/exception/invalid-stock-quantity.exception';
import { Request, Response } from 'express';

@Catch(CustomDomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let httpException: CustomHttpException;

    const status = httpException.getStatus();
    const errorCode = httpException.errorCode;
    const message = httpException.message;
    if (exception instanceof InsufficientStockError) {
      httpException = new InsufficientStockException();
    } else if (exception instanceof InvalidStockQuantityError) {
      httpException = new InvalidStockQuantityException();
    } else {
      httpException = new CustomHttpException('DOMAIN_ERROR', exception.message, HttpStatus.BAD_REQUEST);
    }

    this.logger.warn({
      message: `[DomainError] ${exception.message}`,
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
