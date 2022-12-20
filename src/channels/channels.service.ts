import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessToken } from 'livekit-server-sdk';

import { UsersService } from 'src/users/users.service';
import { Channel, ChannelDocument } from './schemas/channel.schema';
import { LivekitConfig } from 'src/config/types';
import { EChannelType } from './enums/channel-type.enum';
import {
  CreateServerChannelDto,
  CreateUserChannelDto,
} from './dto/create-channel.dto';
import { GetServerChannelsQueryDto } from './dto/get-channels.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

enum RoutingKey {
  CREATE = 'channel.create',
  UPDATE = 'channel.update',
  DELETE = 'channel.delete',
}

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async getChannelById(channelId: string): Promise<ChannelDocument> {
    const channel = await this.channelModel.findById(channelId);

    if (!channel) {
      throw new NotFoundException('channel not found');
    }

    return channel;
  }

  async getUserChannels(userId: string) {
    const channels = await this.channelModel
      .find({
        userIds: userId,
      })
      .sort({ lastMessageDate: -1 })
      .populate('users');

    return channels;
  }

  async getServerChannels({ serverId }: GetServerChannelsQueryDto) {
    const channels = await this.channelModel.find({ serverId });

    return channels;
  }

  async createUserChannel(userId: string, { users }: CreateUserChannelDto) {
    if (!users.includes(userId)) {
      throw new ForbiddenException();
    }

    if (users.length !== new Set(users).size) {
      throw new BadRequestException('contains duplicates');
    }

    const existingChannel = await this.channelModel.find({ userIds: users });

    if (existingChannel && existingChannel.length > 0) {
      throw new BadRequestException(
        'Channel between these users already created',
      );
    }

    const channel = new this.channelModel({
      type: EChannelType.PRIVATE,
      serverId: null,
      userIds: users,
      lastMessageDate: new Date().toISOString(),
    });
    const result = await channel.save();
    const populated = await result.populate('users');

    this.amqpConnection.publish('default', RoutingKey.CREATE, populated);

    return populated;
  }

  async createServerChannel({
    name,
    type,
    parentId,
    serverId,
  }: CreateServerChannelDto) {
    if (parentId) {
      const parent = await this.getChannelById(parentId);

      if (parent.type !== EChannelType.PARENT) {
        throw new BadRequestException('Invalid parent');
      }
    }

    const channel = new this.channelModel({
      name,
      type,
      serverId,
      lastMessageDate: null,
      parentId: parentId ? parentId : null,
    });
    const result = await channel.save();

    this.amqpConnection.publish('default', RoutingKey.CREATE, result);

    return result;
  }

  async getUserChannelRTCToken(userId: string, channelId: string) {
    const channel = await this.getChannelById(channelId);

    if (channel.type !== EChannelType.PRIVATE) {
      throw new BadRequestException('invalid channel type');
    }

    const desiredChannelUser = channel.userIds.find((id) => userId === id);

    if (!desiredChannelUser) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.getUserById(userId);

    const { apiKey, secret } = this.configService.get<LivekitConfig>('livekit');

    const accessToken = new AccessToken(apiKey, secret, {
      identity: user.username,
    });
    accessToken.addGrant({ roomJoin: true, room: channelId });

    return { token: accessToken.toJwt() };
  }

  async getServerChannelRTCToken(userId: string, channelId: string) {
    const channel = await this.getChannelById(channelId);

    if (channel.type !== EChannelType.VOICE) {
      throw new BadRequestException('invalid channel type');
    }

    const user = await this.usersService.getUserById(userId);

    const { apiKey, secret } = this.configService.get<LivekitConfig>('livekit');

    const accessToken = new AccessToken(apiKey, secret, {
      identity: user.username,
    });
    accessToken.addGrant({ roomJoin: true, room: channelId });

    return { token: accessToken.toJwt() };
  }

  async updateLastMessageDate(channelId: string, date: string) {
    await this.channelModel.updateOne(
      {
        _id: channelId,
        lastMessageDate: { $lt: date },
      },
      {
        $set: { lastMessageDate: date },
      },
      { new: true },
    );

    return { status: 'ok' };
  }
}
