import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { ICloudflareConfig, IRabbitMqConfig } from 'src/config/types';
import { UsersModule } from 'src/users/users.module';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { MessagesController } from './messages/messages.controller';
import { MessagesService } from './messages/messages.service';
import { Message, MessageSchema } from './messages/schemas/message.schema';
import { Channel, ChannelSchema } from './schemas/channel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UsersModule,
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
  ],
  controllers: [ChannelsController, MessagesController],
  providers: [
    ChannelsService,
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
})
export class ChannelsModule {}
