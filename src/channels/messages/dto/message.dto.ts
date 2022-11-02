import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  MAX_ATTACHMENTS,
  MIN_ATTACHMENTS,
} from '../constants/messages.constants';

export class MessageAttachment {
  @IsNotEmpty()
  @IsString()
  key: string;
}

export class MessageDto {
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => MessageAttachment)
  @ArrayMaxSize(MAX_ATTACHMENTS)
  @ArrayMinSize(MIN_ATTACHMENTS)
  attachments?: MessageAttachment[];

  @IsOptional()
  message_reference?: string;

  @IsNotEmpty()
  @IsString()
  nonce: string;
}
