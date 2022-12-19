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
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserId } from 'src/common/decorators/userId.decorator';
import { CustomSerializerInterceptor } from 'src/common/interceptors/custom-serializer.interceptor';
import { CreateAttachmentsDto } from './dto/create-attachments.dto';
import { ManageMessageParamsDto } from './dto/manage-message-params.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

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
    return this.messagesService.getMessages(userId, channelId, query);
  }

  @UseInterceptors(CustomSerializerInterceptor(Message))
  @Post(':channelId/messages')
  async sendMessage(
    @Body() message: SendMessageDto,
    @UserId() userId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.messagesService.sendMessage(userId, channelId, message);
  }

  @UseInterceptors(CustomSerializerInterceptor(Message))
  @Patch(':channelId/messages/:messageId')
  async updateMessage(
    @Body() message: UpdateMessageDto,
    @UserId() userId: string,
    @Param() params: ManageMessageParamsDto,
  ) {
    return this.messagesService.updateMessage(userId, params, message);
  }

  @Delete(':channelId/messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @UserId() userId: string,
    @Param() params: ManageMessageParamsDto,
  ) {
    return this.messagesService.deleteMessage(userId, params);
  }

  @Post(':channelId/attachments')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleAttachments(
    @Body() attachments: CreateAttachmentsDto,
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
