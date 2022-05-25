import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserId } from '@communicator/common';

import { MessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

@Controller('')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':channelId/messages')
  async getChannelMessages(
    @Body() message: MessageDto,
    @UserId() userId: string,
    @Param('channelId') channelId: string,
    @Query() query,
  ) {
    return this.messagesService.getChannelMessages(userId, channelId, query);
  }

  @Post(':channelId/messages')
  async handleMessage(
    @Body() message: MessageDto,
    @UserId() userId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.messagesService.handleMessage({
      userId,
      channelId,
      message,
    });
  }
}
