import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MessageAttachment {
  filename: string;
  id: string;
  data: string;
}

export class MessageDto {
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: MessageAttachment[];

  @IsOptional()
  message_reference?: string;

  @IsNotEmpty()
  @IsString()
  nonce: string;
}
