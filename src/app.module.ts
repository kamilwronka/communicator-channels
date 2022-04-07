import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { MessagesModule } from './messages/messages.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [MessagesModule, ChannelsModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
