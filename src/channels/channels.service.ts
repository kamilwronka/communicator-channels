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
// import { UpdateLastMessageDateDto } from './dto/update-last-message-date.dto';
import { Channel, ChannelDocument } from './schemas/channel.schema';
import { ILivekitConfig } from 'src/config/types';
import { EChannelType } from './enums/channel-type.enum';
import {
  CreateServerChannelDto,
  CreateUserChannelDto,
} from './dto/create-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
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
        'users.userId': userId,
      })
      .sort({ lastMessageDate: -1 });

    return channels;
  }

  async getServerChannels(serverId: string) {
    const channels = await this.channelModel.find({ serverId: serverId });

    return channels;
  }

  async createUserChannel({ users }: CreateUserChannelDto) {
    if (users[0].userId === users[1].userId) {
      throw new BadRequestException(
        'Cannot create channel for the same person',
      );
    }

    const existingChannel = await this.channelModel.find({ users });

    if (existingChannel && existingChannel.length > 0) {
      throw new BadRequestException(
        'Channel between these users already created',
      );
    }

    const channel = new this.channelModel({
      type: EChannelType.PRIVATE,
      serverId: null,
      users,
      lastMessageDate: new Date().toISOString(),
    });

    return channel.save();
  }

  async createServerChannel(
    serverId: string,
    { name, type, parentId }: CreateServerChannelDto,
  ) {
    if (parentId) {
      const parent = await this.getChannelById(parentId);

      if (!parent) {
        throw new BadRequestException('Invalid parent id');
      }

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

    return channel.save();
  }

  async getUserChannelRTCToken(userId: string, channelId: string) {
    const channel = await this.getChannelById(channelId);

    if (channel.type !== EChannelType.PRIVATE) {
      throw new BadRequestException('invalid channel type');
    }

    const desiredChannelUser = channel.users.find(
      (user) => userId === user.userId,
    );

    if (!desiredChannelUser) {
      throw new ForbiddenException();
    }

    const user = await this.usersService.getUserData(userId);

    const { apiKey, secret } =
      this.configService.get<ILivekitConfig>('livekit');

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

    const user = await this.usersService.getUserData(userId);

    const { apiKey, secret } =
      this.configService.get<ILivekitConfig>('livekit');

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
