import { NestFactory } from '@nestjs/core';
import { CoreApiModule } from './core-api.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@api/exception/http-exception.filter';
import { UnexpectedErrorFilter } from '@api/exception/unexpeted-error.filter';
import { DomainExceptionFilter } from '@api/exception/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(CoreApiModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new UnexpectedErrorFilter(), new HttpExceptionFilter(), new DomainExceptionFilter());
  await app.listen(process.env.port ?? 3000);
}

bootstrap();
