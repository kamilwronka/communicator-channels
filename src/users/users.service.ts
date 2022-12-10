import {
  MessageHandlerErrorBehavior,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

enum RoutingKey {
  CREATE = 'user.create',
  UPDATE = 'user.update',
  DELETE = 'user.delete',
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
  ) {}
  private readonly logger = new Logger(UsersService.name);

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({ userId: id });

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.userRepository.findById(id);
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.CREATE,
    queue: 'channels-user-create',
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  @UsePipes(ValidationPipe)
  async create({ id, ...data }: CreateUserDto) {
    try {
      const user = new this.userRepository({ userId: id, ...data });

      await user.save();
      this.logger.log(`Created user with id: ${id}`);
    } catch (error) {
      this.logger.error(`Unable to create user: ${JSON.stringify(error)}`);
      new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.UPDATE,
    queue: 'channels-user-update',
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async update({ id, ...data }: UpdateUserDto) {
    try {
      const response = await this.userRepository.findOneAndUpdate(
        { userId: id },
        data,
      );

      if (response) {
        this.logger.log(`Updated user with id: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Unable to update user: ${JSON.stringify(error)}`);
      new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.DELETE,
    queue: 'channels-user-delete',
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async delete({ id }: DeleteUserDto) {
    try {
      const response = await this.userRepository.findOneAndDelete({
        userId: id,
      });

      if (response) {
        this.logger.log(`Deleted user with id: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Unable to delete user: ${JSON.stringify(error)}`);
      new Nack();
    }
  }
}
