import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message, MessageSchema } from './schemas/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ICloudflareConfig, IRabbitMqConfig } from 'src/config/types';
import { ServersModule } from 'src/servers/servers.module';
import { UsersModule } from 'src/users/users.module';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  providers: [
    MessagesService,
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { accountId, apiKey, secret } =
          configService.get<ICloudflareConfig>('cloudflare');

        return new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: apiKey,
            secretAccessKey: secret,
          },
        });
      },
    },
  ],
  controllers: [MessagesController],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ClientsModule.registerAsync([
      {
        name: 'GATEWAY',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
          const { user, password, host, port, queue } =
            configService.get<IRabbitMqConfig>('rabbitmq');

          return {
            transport: Transport.RMQ,
            options: {
              urls: [`amqp://${user}:${password}@${host}:${port}`],
              queue,
              queueOptions: {
                durable: false,
              },
            },
          };
        },
      },
    ]),
    ServersModule,
    UsersModule,
  ],
})
export class MessagesModule {}
