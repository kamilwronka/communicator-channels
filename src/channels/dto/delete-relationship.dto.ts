import { IsString } from 'class-validator';
import { User } from '../../users/schemas/user.schema';

export class DeleteRelationshipDto {
  @IsString()
  id: string;

  creator: User;

  receiver: User;
}
