import { IsMongoId, IsString } from 'class-validator';

export class GetServerChannelsQueryDto {
  @IsMongoId()
  serverId: string;
}

export class GetUserChannelsDto {
  @IsString()
  userId: string;
}
