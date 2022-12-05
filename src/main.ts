import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './config/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const { port } = configService.get<AppConfig>('app');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  Logger.log(`Starting application on port ${port}...`, 'App');
  await app.listen(port);
}
bootstrap();
