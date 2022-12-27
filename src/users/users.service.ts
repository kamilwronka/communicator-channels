import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { DLQRetryCheckerInterceptor } from 'src/common/interceptors/dlq-retry-checker.interceptor';
import {
  DEAD_LETTER_EXCHANGE_NAME,
  DEFAULT_EXCHANGE_NAME,
} from 'src/config/rabbitmq.config';
import { UsersRoutingKey } from './enums/users-routing-key.enum';
import { UsersQueue } from './enums/users-queue.enum';

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

    return user;
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: UsersRoutingKey.CREATE,
    queue: UsersQueue.CREATE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(UsersQueue.CREATE))
  async create({ id, version, version_hash, avatar, username }: CreateUserDto) {
    try {
      const user = new this.userRepository({
        userId: id,
        username,
        avatar,
        versionHash: version_hash,
      });

      await user.save();
      this.logger.log(`Created user with id: ${id} and version of ${version}.`);
    } catch (error) {
      this.logger.error(`Unable to create user: ${JSON.stringify(error)}`);

      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: UsersRoutingKey.UPDATE,
    queue: UsersQueue.UPDATE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(UsersQueue.UPDATE))
  async update({ id, version, avatar, version_hash, username }: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({
        userId: id,
        version: version - 2, // because users service starts with the version of 1
      });

      if (!user) {
        return new Nack();
      }

      user.avatar = avatar;
      user.username = username;
      user.versionHash = version_hash;

      await user.save();

      this.logger.log(`Updated user with id: ${id} and version of ${version}.`);
    } catch (error) {
      this.logger.error(`Unable to update user: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: UsersRoutingKey.DELETE,
    queue: UsersQueue.DELETE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(UsersQueue.DELETE))
  async delete({ id }: DeleteUserDto) {
    try {
      await this.userRepository.findOneAndDelete({
        userId: id,
      });

      this.logger.log(`Deleted user with id: ${id}`);
    } catch (error) {
      this.logger.error(`Unable to delete user: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }
}
