import { IsMongoId, IsString } from 'class-validator';

export class ManageMessageParamsDto {
  @IsString()
  @IsMongoId()
  channelId: string;

  @IsString()
  @IsMongoId()
  messageId: string;
}
