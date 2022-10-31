import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserId } from 'src/decorators/userId.decorator';

import { MessageDto } from './dto/message.dto';
import { MessageAttachmentsDto } from './dto/messageAttachments.dto';
import { MessagesService } from './messages.service';

@Controller('')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get(':channelId/messages')
  async getChannelMessages(
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
    return this.messagesService.handleMessage(userId, channelId, message);
  }

  @Post(':channelId/attachments')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleAttachments(
    @Body() attachments: MessageAttachmentsDto,
    @UserId() userId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.messagesService.handleAttachments(
      userId,
      channelId,
      attachments,
    );
  }
}
