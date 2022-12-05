import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  MAX_ATTACHMENTS,
  MIN_ATTACHMENTS,
} from '../constants/messages.constants';

export class Attachment {
  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}

export class CreateAttachmentsDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Attachment)
  @ArrayMaxSize(MAX_ATTACHMENTS)
  @ArrayMinSize(MIN_ATTACHMENTS)
  files: Attachment[];
}
