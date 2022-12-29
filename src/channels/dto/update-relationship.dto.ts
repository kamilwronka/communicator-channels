import { Type } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { User } from '../../users/schemas/user.schema';
import { RelationshipStatus } from '../enums/relationship-status.enum';

export class UpdateRelationshipDto {
  @IsString()
  id: string;

  @Type(() => User)
  creator: User;

  @Type(() => User)
  receiver: User;

  @IsEnum(RelationshipStatus)
  status: RelationshipStatus;
}
