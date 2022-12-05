import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  MAX_ATTACHMENTS,
  MAX_CONTENT_LENGTH,
  MIN_ATTACHMENTS,
} from '../constants/messages.constants';
import { MessageAttachment } from './send-message.dto';

export class UpdateMessageDto {
  @ValidateIf((o: UpdateMessageDto) => !o.attachments)
  @IsNotEmpty()
  @IsString()
  @MaxLength(MAX_CONTENT_LENGTH)
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
}
