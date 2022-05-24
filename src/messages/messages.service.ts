import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GCPubSubClient } from 'nestjs-google-pubsub-microservice';
import { configService } from 'src/config/config.service';
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

  async getChannelMessages(userId: string, channelId) {
    const messages = await this.messageModel.find({ channel_id: channelId });

    return messages;
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
      client.emit('message', dbResponse).subscribe();
    } catch (error) {
      console.log(error);
    }

    return dbResponse;
  }
}
