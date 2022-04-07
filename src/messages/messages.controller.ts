import { Body, Controller, Param, Post } from '@nestjs/common';
import { UserId } from '@communicator/common';

import { MessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

@Controller('')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post(':channelId/messages')
  async handleMessage(
    @Body() message: MessageDto,
    @UserId() userId: string,
    @Param('serverId') serverId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.messagesService.handleMessage({
      userId,
      serverId,
      channelId,
      message,
    });
  }
}
