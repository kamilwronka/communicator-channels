import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configService } from './config/config.service';

async function bootstrap() {
  await configService.setup(['ENV', 'PORT']);
  const port = configService.getPort();

  const app = await NestFactory.create(AppModule);

  Logger.log(`Starting application on port ${port}`);

  await app.listen(port);
}
bootstrap();
