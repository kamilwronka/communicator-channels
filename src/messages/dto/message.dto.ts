import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MessageDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  nonce: string;
}
