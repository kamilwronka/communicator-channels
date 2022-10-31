import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import mongoConfig from './config/mongo.config';
import servicesConfig from './config/services.config';
import cloudflareConfig from './config/cloudflare.config';
import appConfig from './config/app.config';
import rabbitmqConfig from './config/rabbitmq.config';

import { HealthController } from './health/health.controller';
import { MessagesModule } from './messages/messages.module';
import { EEnvironment, IMongoConfig } from './config/types';
import { UsersModule } from './users/users.module';
import { ServersModule } from './servers/servers.module';

@Module({
  imports: [
    MessagesModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { database, host, port, password, user } =
          configService.get<IMongoConfig>('mongodb');

        return {
          uri: `mongodb://${user}:${password}@${host}:${port}`,
          ssl: false,
          dbName: database,
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        rabbitmqConfig,
        mongoConfig,
        servicesConfig,
        cloudflareConfig,
      ],
      cache: true,
      validationSchema: Joi.object({
        ENV: Joi.string()
          .valid(EEnvironment.LOCAL, EEnvironment.DEV, EEnvironment.PROD)
          .default(EEnvironment.LOCAL),
        PORT: Joi.number(),
        CDN_URL: Joi.string(),
        MONGODB_PASSWORD: Joi.string(),
        MONGODB_USER: Joi.string(),
        MONGODB_HOST: Joi.string(),
        MONGODB_PORT: Joi.string(),
        MONGODB_DATABASE: Joi.string(),
        RABBITMQ_USER: Joi.string(),
        RABBITMQ_PASSWORD: Joi.string(),
        RABBITMQ_HOST: Joi.string(),
        RABBITMQ_ACCESS_PORT: Joi.string(),
        CLOUDFLARE_ACCOUNT_ID: Joi.string(),
        CLOUDFLARE_ACCESS_KEY_ID: Joi.string(),
        CLOUDFLARE_SECRET_ACCESS_KEY: Joi.string(),
        CLOUDFLARE_R2_BUCKET_NAME: Joi.string(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    UsersModule,
    ServersModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
