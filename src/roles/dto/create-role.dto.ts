import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];

  @IsNotEmpty()
  @IsNumber()
  version: number;
}
