import { IsMongoId, IsString } from 'class-validator';

export class GetServerChannelsDto {
  @IsMongoId()
  serverId: string;
}

export class GetUserChannelsDto {
  @IsString()
  userId: string;
}
