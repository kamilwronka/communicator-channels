import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { MessagesModule } from './messages/messages.module';
import { MongooseModule } from '@nestjs/mongoose';
import { configService } from './config/config.service';

@Module({
  imports: [
    MessagesModule,
    MongooseModule.forRootAsync({
      useFactory: () => {
        const config = configService.getMongoConnectionConfig();

        return {
          uri: config.connectionUri,
          ssl: true,
          dbName: config.database,
        };
      },
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
