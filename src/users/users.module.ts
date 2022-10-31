import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IServicesConfig } from 'src/config/types';
import { UsersService } from './users.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { users } = configService.get<IServicesConfig>('services');

        return {
          baseURL: users,
          maxRedirects: 5,
          timeout: 5000,
        };
      },
    }),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
