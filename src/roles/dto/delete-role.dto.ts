import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteRoleDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
