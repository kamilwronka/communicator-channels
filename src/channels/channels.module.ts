import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsService],
  imports: [MessagesModule],
})
export class ChannelsModule {}
