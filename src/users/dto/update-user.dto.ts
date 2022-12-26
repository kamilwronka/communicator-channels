import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsNumber()
  version: number;

  @IsString()
  version_hash: string;
}
