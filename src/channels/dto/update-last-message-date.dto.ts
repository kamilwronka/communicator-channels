import {
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateLastMessageDateDto {
  @IsNotEmpty()
  @IsNumberString()
  @Matches(/^[0-9]{13}$/)
  timestamp: string;
}

export class UpdateLastMessageDateParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  channelId: string;
}
