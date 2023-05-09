import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChannelsService } from 'src/channels/channels.service';
import { AWSConfig } from 'src/config/types';
import { MembersService } from '../members/members.service';

import { CreateAttachmentsDto } from './dto/create-attachments.dto';
import { GetMessagesQueryDto } from './dto/get-messages.dto';
import { ManageMessageParamsDto } from './dto/manage-message-params.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { createMessageAttachments } from './helpers/createMessageAttachments.helper';
import { generateFileUploadData } from './helpers/generateFileUploadData.helper';
import { parseMessageContent } from './helpers/parseMessageContent.helper';
import { Attachment } from './schemas/attachment.schema';
import { Message, MessageDocument } from './schemas/message.schema';

enum RoutingKey {
  MESSAGE_SEND = 'message.send',
  MESSAGE_UPDATE = 'message.update',
  MESSAGE_DELETE = 'message.delete',
  MESSAGE_REACTION_ADD = 'message.reaction.add',
  MESSAGE_REACTION_DELETE = 'message.reaction.delete',
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
    private readonly channelsService: ChannelsService,
    private readonly amqpConnection: AmqpConnection,
    private readonly membersService: MembersService,
  ) {}

  async getMessages(channelId: string, { limit, before }: GetMessagesQueryDto) {
    const findQuery = {
      channelId,
      ...(before ? { _id: { $lt: before } } : {}),
    };

    const messages = await this.messageModel
      .find(findQuery)
      .sort({ _id: -1 })
      .limit(limit)
      .populate([{ path: 'author' }, { path: 'mentions' }])
      .exec();

    return messages.reverse();
  }

  async sendMessage(userId: string, channelId: string, data: SendMessageDto) {
    const { serverId } = await this.channelsService.getChannelById(channelId);
    const { mentionEveryone, mentions } = parseMessageContent(data.content);

    let attachments: Attachment[] = [];

    if (data.attachments) {
      attachments = createMessageAttachments(data.attachments);
    }

    const messageData: Partial<Message> = {
      attachments,
      authorId: userId,
      channelId,
      content: data.content,
      mentionEveryone,
      mentionRoles: [],
      mentionIds: mentions,
      nonce: data.nonce,
    };

    const message = await new this.messageModel(messageData).save();
    const response = await message.populate([
      { path: 'author' },
      { path: 'mentions' },
    ]);

    this.channelsService.updateLastMessageDate(channelId, response.createdAt);

    this.amqpConnection.publish('default', RoutingKey.MESSAGE_SEND, {
      ...response.toJSON(),
      serverId,
    });

    return response;
  }

  async updateMessage(
    userId: string,
    { messageId }: ManageMessageParamsDto,
    data: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.messageModel.findById(messageId);

    if (!message) {
      throw new NotFoundException();
    }

    const { mentionEveryone, mentions } = parseMessageContent(data.content);

    let attachments: Attachment[] = [];

    if (data.attachments) {
      attachments = createMessageAttachments(data.attachments);
    }

    Object.entries(data).forEach(([key, value]) => {
      message[key] = value;
    });

    message.attachments = attachments;
    message.mentionIds = mentions;
    message.mentionEveryone = mentionEveryone;

    const updatedMessage = await message.save();
    const response = await updatedMessage.populate(['author', 'mentions']);

    this.amqpConnection.publish('default', RoutingKey.MESSAGE_UPDATE, response);

    return response;
  }

  async deleteMessage(userId: string, { messageId }: ManageMessageParamsDto) {
    const message = await this.messageModel.findByIdAndDelete(messageId);

    if (!message) {
      throw new NotFoundException();
    }

    this.amqpConnection.publish('default', RoutingKey.MESSAGE_DELETE, {
      id: message._id,
    });

    return;
  }

  async handleAttachments(
    userId: string,
    channelId: string,
    attachments: CreateAttachmentsDto,
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
          ContentLength: file.fileSize,
        }),
      ).then((url) => ({ url, key, fileSize: file.fileSize }));
    });

    return Promise.all(files);
  }
}
