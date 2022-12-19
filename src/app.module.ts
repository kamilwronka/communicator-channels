import { Module } from '@nestjs/common';

import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';

import { MessagesModule } from './messages/messages.module';
import { CONFIG_MODULE_CONFIG } from './config/config-module.config';
import { MembersModule } from './members/members.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get<MongooseModuleOptions>('mongodb');
      },
    }),
    ConfigModule.forRoot(CONFIG_MODULE_CONFIG),
    UsersModule,
    ChannelsModule,
    MessagesModule,
    MembersModule,
    RolesModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
