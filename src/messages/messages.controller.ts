import { Body, Controller, Param, Post } from '@nestjs/common';
import { UserId } from '@communicator/common';

import { MessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

@Controller('message')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post(':server_id/:channel_id')
  async handleMessage(
    @Body() message: MessageDto,
    @UserId() userId: string,
    @Param('server_id') serverId: string,
    @Param('channel_id') channelId: string,
  ) {
    console.log(message);
    return this.messagesService.handleMessage({
      userId,
      serverId,
      channelId,
      message,
    });
  }
}
