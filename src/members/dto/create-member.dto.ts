import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  serverId: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  @IsNotEmpty()
  @IsNumber()
  version: number;

  @IsString()
  versionHash: string;
}
