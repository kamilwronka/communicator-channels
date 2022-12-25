import {
  defaultNackErrorHandler,
  MessageHandlerErrorBehavior,
  Nack,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    return user;
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.CREATE,
    queue: 'channels-user-create',
  })
  async create({ id, version, ...data }: CreateUserDto) {
    try {
      const user = new this.userRepository({ userId: id, ...data });

      await user.save();
      this.logger.log(`Created user with id: ${id} and version of ${version}.`);
    } catch (error) {
      this.logger.error(`Unable to create user: ${JSON.stringify(error)}`);

      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RoutingKey.UPDATE,
    queue: 'channels-user-update',
    queueOptions: {
      deadLetterExchange: 'x-dead-letter-exchange-ttl',
      deadLetterRoutingKey: RoutingKey.UPDATE,
    },
    errorHandler: defaultNackErrorHandler,
  })
  async update({ id, version, ...data }: UpdateUserDto, msg) {
    console.log({ id, version, ...data });
    if (msg.fields.deliveryTag >= 10) {
      console.log('retry exceeded');
      return;
    }

    console.log('handling xxxx', msg);

    throw new Error();

    // return new Nack(false);

    // try {
    // const user = await this.userRepository.findOne({
    //   userId: id,
    //   // version: version - 1,
    // });

    // console.log(user);

    // if (!user) {
    //   return new Nack(false);
    // }

    // user.set({ ...data });
    // await user.save();

    // this.logger.log(`Updated user with id: ${id} and version of ${version}.`);
    // } catch (error) {
    //   this.logger.error(`Unable to update user: ${JSON.stringify(error)}`);
    //   return new Nack();
    // }
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
