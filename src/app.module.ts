import { Module } from '@nestjs/common';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import mongoConfig from './config/mongo.config';
import servicesConfig from './config/services.config';
import appConfig from './config/app.config';
import rabbitmqConfig from './config/rabbitmq.config';
import livekitConfig from './config/livekit.config';

import { HealthController } from './health/health.controller';
import { MongoConfig } from './config/types';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import awsConfig from './config/aws.config';
import { RuntimeEnvironment } from './types/common';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { database, host, port, password, user } =
          configService.get<MongoConfig>('mongodb');

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
        awsConfig,
        livekitConfig,
      ],
      cache: true,
      validationSchema: Joi.object({
        ENV: Joi.string()
          .valid(
            RuntimeEnvironment.LOCAL,
            RuntimeEnvironment.DEV,
            RuntimeEnvironment.PROD,
          )
          .default(RuntimeEnvironment.LOCAL),
        PORT: Joi.number(),
        MONGODB_PASSWORD: Joi.string(),
        MONGODB_USER: Joi.string(),
        MONGODB_HOST: Joi.string(),
        MONGODB_PORT: Joi.string(),
        MONGODB_DATABASE: Joi.string(),
        RABBITMQ_USER: Joi.string(),
        RABBITMQ_PASSWORD: Joi.string(),
        RABBITMQ_HOST: Joi.string(),
        RABBITMQ_ACCESS_PORT: Joi.string(),
        AWS_ACCESS_KEY_ID: Joi.string(),
        AWS_SECRET_ACCESS_KEY: Joi.string(),
        AWS_S3_BUCKET_NAME: Joi.string(),
        LIVEKIT_API_KEY: Joi.string(),
        LIVEKIT_API_SECRET: Joi.string(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    UsersModule,
    ChannelsModule,
    MessagesModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
