import { NestFactory } from '@nestjs/core';
import { CoreApiModule } from './core-api.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '@api/exception/http-exception.filter';

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
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.port ?? 3000);
}

bootstrap();
