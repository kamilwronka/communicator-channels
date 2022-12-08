import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UserId } from 'src/decorators/userId.decorator';
import { CustomSerializerInterceptor } from '../interceptors/custom-serializer.interceptor';
import { ChannelsService } from './channels.service';
import {
  CreateServerChannelDto,
  CreateUserChannelDto,
} from './dto/create-channel.dto';
import {
  GetServerChannelsDto,
  GetUserChannelsDto,
} from './dto/get-channels.dto';
import {
  GetServerChannelRTCTokenParamsDto,
  GetServerChannelRTCTokenQueryDto,
  GetUserChannelRTCTokenParamsDto,
} from './dto/get-rtc-token.dto';
import { Channel } from './schemas/channel.schema';

@Controller('')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Get('internal/private/:userId')
  async getUserChannels(
    @Param() params: GetUserChannelsDto,
  ): Promise<Channel[]> {
    return this.channelsService.getUserChannels(params);
  }

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Get('internal/servers/:serverId')
  async getServerChannels(
    @Param() params: GetServerChannelsDto,
  ): Promise<Channel[]> {
    return this.channelsService.getServerChannels(params);
  }

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Post('internal/private')
  async createUserChannel(@Body() createChannelData: CreateUserChannelDto) {
    return this.channelsService.createUserChannel(createChannelData);
  }

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Post('internal/servers')
  async createServerChannel(@Body() createChannelData: CreateServerChannelDto) {
    return this.channelsService.createServerChannel(createChannelData);
  }

  @Get(':channelId/rtc-token')
  async getUserChannelRTCToken(
    @UserId() userId: string,
    @Param() params: GetUserChannelRTCTokenParamsDto,
  ) {
    return this.channelsService.getUserChannelRTCToken(
      userId,
      params.channelId,
    );
  }

  @Get(':channelId/server-rtc-token')
  async getServerChannelRTCToken(
    @Param() params: GetServerChannelRTCTokenParamsDto,
    @Query() query: GetServerChannelRTCTokenQueryDto,
  ) {
    return this.channelsService.getServerChannelRTCToken(
      query.userId,
      params.channelId,
    );
  }
}
