import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeleteUserDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNumber()
  version: number;
}
