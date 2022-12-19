import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteMemberDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  serverId: string;
}
