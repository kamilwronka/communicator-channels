import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class GetUserChannelRTCTokenParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  channelId: string;
}

export class GetServerChannelRTCTokenParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  channelId: string;
}
export class GetServerChannelRTCTokenQueryDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
