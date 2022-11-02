import {
  Body,
  Controller,
  Get,
  Param,
  //   Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserId } from 'src/decorators/userId.decorator';
import { ChannelsService } from './channels.service';
import {
  CreateServerChannelDto,
  CreateServerChannelParamsDto,
  CreateUserChannelDto,
} from './dto/create-channel.dto';
import { GetServerChannelsParamsDto } from './dto/get-channels.dto';
import {
  GetServerChannelRTCTokenParamsDto,
  GetServerChannelRTCTokenQueryDto,
  GetUserChannelRTCTokenParamsDto,
} from './dto/get-rtc-token.dto';
// import {
//   UpdateLastMessageDateDto,
//   UpdateLastMessageDateParamsDto,
// } from './dto/update-last-message-date.dto';

@Controller('')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}
  @Get('')
  async getUserChannels(@UserId() userId: string) {
    return this.channelsService.getUserChannels(userId);
  }

  @Post('')
  async createUserChannel(@Body() createChannelData: CreateUserChannelDto) {
    return this.channelsService.createUserChannel(createChannelData);
  }

  //   @Patch(':channelId')
  //   async updateLastMessageDate(
  //     @Param() params: UpdateLastMessageDateParamsDto,
  //     @Body() data: UpdateLastMessageDateDto,
  //   ) {
  //     return this.channelsService.updateLastMessageDate(params.channelId, data);
  //   }

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

  @Get('servers/:serverId')
  async getServerChannels(@Param() params: GetServerChannelsParamsDto) {
    return this.channelsService.getServerChannels(params.serverId);
  }

  @Post('servers/:serverId')
  async createServerChannel(
    @Param() params: CreateServerChannelParamsDto,
    @Body() createChannelData: CreateServerChannelDto,
  ) {
    return this.channelsService.createServerChannel(
      params.serverId,
      createChannelData,
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
