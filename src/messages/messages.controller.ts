import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { CustomSerializerInterceptor } from 'src/common/interceptors/custom-serializer.interceptor';
import { AuthGuard } from '../common/guards/auth/auth.guard';
import { Permission } from '../common/guards/permissions/permission.enum';
import { Permissions } from '../common/guards/permissions/permissions.decorator';
import { PermissionsGuard } from '../common/guards/permissions/permissions.guard';
import { CreateAttachmentsDto } from './dto/create-attachments.dto';
import {
  GetMessagesParamsDto,
  GetMessagesQueryDto,
} from './dto/get-messages.dto';
import { ManageMessageParamsDto } from './dto/manage-message-params.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

import { MessagesService } from './messages.service';
import { Message } from './schemas/message.schema';

@UseInterceptors(CustomSerializerInterceptor(Message))
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Permissions(Permission.VIEW_MESSAGES)
  @Get(':channelId/messages')
  async getChannelMessages(
    @Param() { channelId }: GetMessagesParamsDto,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.messagesService.getMessages(channelId, query);
  }

  @Permissions(Permission.SEND_MESSAGES)
  @Post(':channelId/messages')
  async sendMessage(
    @Body() message: SendMessageDto,
    @UserId() userId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.messagesService.sendMessage(userId, channelId, message);
  }

  @Permissions(Permission.SEND_MESSAGES)
  @Patch(':channelId/messages/:messageId')
  async updateMessage(
    @Body() message: UpdateMessageDto,
    @UserId() userId: string,
    @Param() params: ManageMessageParamsDto,
  ) {
    return this.messagesService.updateMessage(userId, params, message);
  }

  @Permissions(Permission.DELETE_MESSAGES)
  @Delete(':channelId/messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @UserId() userId: string,
    @Param() params: ManageMessageParamsDto,
  ) {
    return this.messagesService.deleteMessage(userId, params);
  }

  @Permissions(Permission.SEND_ATTACHMENTS)
  @Post(':channelId/attachments')
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
