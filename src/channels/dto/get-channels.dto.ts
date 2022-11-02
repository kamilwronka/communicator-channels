import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class GetPrivateChannelsParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  userId: string;
}

export class GetServerChannelsParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  serverId: string;
}
