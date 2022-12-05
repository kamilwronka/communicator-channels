import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserId } from 'src/decorators/userId.decorator';
import { CustomSerializerInterceptor } from 'src/interceptors/custom-serializer.interceptor';

import { MessageDto } from './dto/message.dto';
import { MessageAttachmentsDto } from './dto/messageAttachments.dto';
import { MessagesService } from './messages.service';
import { Message } from './schemas/message.schema';

@Controller('')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseInterceptors(CustomSerializerInterceptor(Message))
  @Get(':channelId/messages')
  async getChannelMessages(
    @UserId() userId: string,
    @Param('channelId') channelId: string,
    @Query() query,
  ) {
    return this.messagesService.getChannelMessages(userId, channelId, query);
  }

  @UseInterceptors(CustomSerializerInterceptor(Message))
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
