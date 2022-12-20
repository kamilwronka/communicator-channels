import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { AWSConfig } from 'src/config/types';
import { ChannelsModule } from 'src/channels/channels.module';
import { RabbitMQConfig, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MembersModule } from '../members/members.module';
import { PermissionsGuard } from '../common/guards/permissions/permissions.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    ChannelsModule,
    MembersModule,
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get<RabbitMQConfig>('rabbitmq');
      },
    }),
  ],
  providers: [
    MessagesService,
    {
      provide: 'PERMISSIONS_GUARD',
      useClass: PermissionsGuard,
    },
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { accessKeyId, secret } = configService.get<AWSConfig>('aws');

        return new S3Client({
          region: 'eu-central-1',
          credentials: {
            accessKeyId,
            secretAccessKey: secret,
          },
        });
      },
    },
  ],
  controllers: [MessagesController],
})
export class MessagesModule {}
