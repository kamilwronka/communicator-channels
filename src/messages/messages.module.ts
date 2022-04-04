import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UsersModule } from '@communicator/common';

@Module({
  providers: [MessagesService],
  controllers: [MessagesController],
  imports: [UsersModule],
})
export class MessagesModule {}
