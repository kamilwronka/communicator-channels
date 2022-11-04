import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { lookup } from 'mime-types';
import { Model, Types } from 'mongoose';
import { IAWSConfig, IServicesConfig } from 'src/config/types';
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
      channel_id: channelId,
      ...(before ? { _id: { $lt: before } } : {}),
    };

    const messages = await this.messageModel
      .find(findQuery)
      .sort({ created_at: 'desc' })
      // .skip(before * limit)
      .limit(limit)
      .exec();

    return messages.reverse();
  }

  async handleMessage(userId: string, channelId: string, message: MessageDto) {
    const sender = await this.usersService.getUserData(userId);
    const parsedContent = parseMessageContent(message.content);

    let mentions = [];
    const attachments: Attachment[] = [];

    if (parsedContent.mentions.length > 0) {
      mentions = await Promise.all(
        parsedContent.mentions.map((mention) => {
          return this.usersService
            .getUserData(mention)
            .then((res) => res)
            .catch((error) => console.log(error));
        }),
      );
    }

    if (message.attachments) {
      const { cdn } = this.configService.get<IServicesConfig>('services');

      message.attachments.forEach((attachment) => {
        const mimeType = lookup(attachment.key);

        if (mimeType) {
          attachments.push({
            url: `${cdn}/${attachment.key}`,
            mimeType,
          });
        }
      });
    }

    const newMessage: Message = {
      attachments,
      author: sender,
      channel_id: channelId,
      content: message.content,
      mention_everyone: parsedContent.mentionEveryone,
      mention_roles: [],
      mentions,
      _id: new Types.ObjectId().toString(),
      nonce: message.nonce,
    };

    const newMessageInstance = new this.messageModel(newMessage);
    const dbResponse = await newMessageInstance.save();

    this.channelsService.updateLastMessageDate(
      channelId,
      dbResponse.created_at,
    );

    this.gatewayClient.emit('message', dbResponse).subscribe();

    return dbResponse;
  }

  async handleAttachments(
    userId: string,
    channelId: string,
    attachments: MessageAttachmentsDto,
  ) {
    const { bucketName } = this.configService.get<IAWSConfig>('aws');

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
