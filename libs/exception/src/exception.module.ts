import { Logger, Module } from '@nestjs/common';
import { GlobalExceptionFilter } from '@api/exception/global-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    Logger, // GlobalExceptionFilter가 Logger를 주입받으므로 함께 제공
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class ExceptionModule {}
