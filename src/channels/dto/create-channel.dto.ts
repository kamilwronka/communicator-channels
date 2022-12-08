import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EChannelType } from '../enums/channel-type.enum';

export class CreateUserChannelDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  users: string[];
}

export class CreateServerChannelDto {
  @IsNotEmpty()
  @IsMongoId()
  serverId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(EChannelType)
  type: EChannelType;

  @IsOptional()
  @IsString()
  @IsMongoId()
  parentId?: string;
}

export class CreateServerChannelParamsDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  serverId: string;
}
