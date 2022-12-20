import { Type } from 'class-transformer';
import { IsMongoId, IsNumber, IsOptional, Max } from 'class-validator';
import { MESSAGES_FETCH_LIMIT } from '../constants/messages.constants';

export class GetMessagesQueryDto {
  @IsOptional()
  @IsNumber()
  @Max(MESSAGES_FETCH_LIMIT)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsMongoId()
  before?: string;
}

export class GetMessagesParamsDto {
  @IsMongoId()
  channelId: string;
}
