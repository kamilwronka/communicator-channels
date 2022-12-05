import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { lookup } from 'mime-types';
import { Model } from 'mongoose';
import { AWSConfig, ServicesConfig } from 'src/config/types';
import { UsersService } from 'src/users/users.service';
import { ChannelsService } from '../channels.service';
import { MessageDto } from './dto/message.dto';
import { MessageAttachmentsDto } from './dto/messageAttachments.dto';
import { generateFileUploadData } from './helpers/generateFileUploadData.helper';
import { Attachment } from './schemas/attachment.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { parseMessageContent } from './utils/parseMessageContent.util';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @Inject('GATEWAY') private gatewayClient: ClientProxy,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
    private readonly channelsService: ChannelsService,
  ) {}

  async getChannelMessages(
    userId: string,
    channelId,
    query: { limit: string; before: string },
  ) {
    const { limit: limitString, before } = query;
    const limit = parseInt(limitString, 10);

    if (limit > 50) {
      throw new BadRequestException('Maximum limit is 50');
    }

    const findQuery = {
      channelId,
      ...(before ? { _id: { $lt: before } } : {}),
    };

    const messages = await this.messageModel
      .find(findQuery)
      .sort({ createdAt: 'desc' })
      .limit(limit)
      .populate(['mentions', 'author'])
      .exec();

    return messages.reverse();
  }

  async handleMessage(userId: string, channelId: string, data: MessageDto) {
    const { mentionEveryone, mentions } = parseMessageContent(data.content);

    const attachments: Attachment[] = [];

    if (data.attachments) {
      const { cdn } = this.configService.get<ServicesConfig>('services');

      data.attachments.forEach((attachment) => {
        const mimeType = lookup(attachment.key);

        if (mimeType) {
          attachments.push({
            url: `https://${cdn}/${attachment.key}`,
            mimeType,
          });
        }
      });
    }

    const messageData: Partial<Message> = {
      attachments,
      author: userId,
      channelId,
      content: data.content,
      mentionEveryone,
      mentionRoles: [],
      mentions,
      nonce: data.nonce,
    };

    const message = await new this.messageModel(messageData).save();
    const response = await message.populate(['author', 'mentions']);

    this.channelsService.updateLastMessageDate(channelId, response.createdAt);

    this.gatewayClient.emit('message', response).subscribe();

    return response;
  }

  async handleAttachments(
    userId: string,
    channelId: string,
    attachments: MessageAttachmentsDto,
  ) {
    const { bucketName } = this.configService.get<AWSConfig>('aws');

    const files = attachments.files.map((file) => {
      const { key, mimeType } = generateFileUploadData(
        `channels/${channelId}`,
        file.filename,
      );
      return getSignedUrl(
        this.s3Client,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: mimeType ? mimeType : '',
        }),
      ).then((url) => ({ url, key }));
    });

    return Promise.all(files);
  }
}
