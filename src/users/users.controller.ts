import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

enum EVENTS {
  USERS_CREATE = 'USERS_CREATE',
  USERS_UPDATE = 'USERS_UPDATE',
  USERS_DELETE = 'USERS_DELETE',
}

// @UsePipes(
//   new ValidationPipe({
//     transform: true,
//     exceptionFactory: (errors) => `Validation error: ${JSON.stringify(errors)}`,
//   }),
// )
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //   @EventPattern(EVENTS.USERS_CREATE)
  createUser(data: CreateUserDto): void {
    this.usersService.create(data);
  }

  @EventPattern(EVENTS.USERS_UPDATE)
  updateUser(data: UpdateUserDto): void {
    this.usersService.update(data);
  }

  @EventPattern(EVENTS.USERS_DELETE)
  deleteUser(data: DeleteUserDto): void {
    this.usersService.delete(data);
  }
}
