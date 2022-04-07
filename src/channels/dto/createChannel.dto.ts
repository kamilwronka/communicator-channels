import { IsNotEmpty, Validate, ValidateNested } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  server_id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  permission_overwrite: string;
}

export class ChannelPermissions {
  // @IsNotEmpty()
  // allow: boolean
  // @IsNotEmpty()
}
