import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GCPubSubClient } from 'nestjs-google-pubsub-microservice';
import { configService } from 'src/config/config.service';
import { updateLastMessageDate } from 'src/services/servers/servers.service';
import { getUserData } from 'src/services/users/users.service';
import { MessageDto } from './dto/message.dto';
import { Message, MessageDocument } from './schemas/message.schema';
import { parseMessageContent } from './utils/parseMessageContent.util';

export type TMessageData = {
  userId: string;
  channelId: string;
  message: MessageDto;
};

const pubSubConfig = configService.getPubSubConfig();

const client = new GCPubSubClient(pubSubConfig);

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
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

  async handleMessage({ userId, channelId, message }: TMessageData) {
    const sender = await getUserData(userId);

    const parsedContent = parseMessageContent(message.content);

    let mentions = [];

    if (parsedContent.mentions.length > 0) {
      mentions = await Promise.all(
        parsedContent.mentions.map((mention) => {
          return getUserData(mention)
            .then((res) => res)
            .catch((error) => console.log(error));
        }),
      );
    }

    const newMessage: Message = {
      attachments: [],
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
    let dbResponse = {} as Message;

    try {
      dbResponse = await newMessageInstance.save();
    } catch (error) {
      throw new InternalServerErrorException();
    }

    try {
      updateLastMessageDate(channelId, dbResponse.created_at);
      client.emit('message', dbResponse).subscribe();
    } catch (error) {
      console.log(error);
    }

    return dbResponse;
  }
}
