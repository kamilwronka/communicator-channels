import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { USER_ID_REGEX } from '../constants/user-id.constant';

export class DeleteUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(USER_ID_REGEX, {
    message: `Should match nanoid (${/[A-Za-z0-9_-]{21}/}) regex`,
  })
  id: string;
}
