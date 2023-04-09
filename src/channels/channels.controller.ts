import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { CustomSerializerInterceptor } from 'src/common/interceptors/custom-serializer.interceptor';
import { AuthGuard } from '../common/guards/auth/auth.guard';
import { Permission } from '../common/guards/permissions/permission.enum';
import { Permissions } from '../common/guards/permissions/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions/permissions.guard';
import { ChannelsService } from './channels.service';
import {
  CreateServerChannelDto,
  CreateUserChannelDto,
} from './dto/create-channel.dto';
import { GetServerChannelsQueryDto } from './dto/get-channels.dto';
import {
  GetServerChannelRTCTokenParamsDto,
  GetServerChannelRTCTokenQueryDto,
  GetUserChannelRTCTokenParamsDto,
} from './dto/get-rtc-token.dto';
import { Channel } from './schemas/channel.schema';

@UseGuards(AuthGuard)
@Controller('')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Get('me')
  async getUserChannels(@UserId() userId: string): Promise<Channel[]> {
    return this.channelsService.getUserChannels(userId);
  }

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Permissions(Permission.VIEW_CHANNELS)
  @UseGuards(PermissionsGuard)
  @Get('')
  async getServerChannels(
    @Query() query: GetServerChannelsQueryDto,
  ): Promise<Channel[]> {
    return this.channelsService.getServerChannels(query);
  }

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Post('me')
  async createUserChannel(
    @UserId() userId: string,
    @Body() createChannelData: CreateUserChannelDto,
  ) {
    return this.channelsService.createUserChannel(userId, createChannelData);
  }

  @UseInterceptors(CustomSerializerInterceptor(Channel))
  @Permissions(Permission.MANAGE_CHANNELS)
  @UseGuards(PermissionsGuard)
  @Post('')
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
