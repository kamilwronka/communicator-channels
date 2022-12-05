import {
  MessageHandlerErrorBehavior,
  Nack,
  RabbitPayload,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
  ) {}
  private readonly logger = new Logger(UsersService.name);

  @RabbitSubscribe({
    exchange: 'default_exchange',
    routingKey: 'users.create',
    queue: 'users-queue',
    errorBehavior: MessageHandlerErrorBehavior.ACK,
    allowNonJsonMessages: true,
  })
  public async pubSubHandler(@RabbitPayload() data: any) {
    console.log(`Received pub/sub xmessage: xd`, data);
    // return new Nack();
  }

  async getUserById(id: string) {
    console.log(id);
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return this.userRepository.findById(id);
  }

  async create({ id, ...data }: CreateUserDto) {
    try {
      const user = new this.userRepository({ _id: id, ...data });

      await user.save();
      this.logger.log(`Created user with id: ${id}`);
    } catch (error) {
      this.logger.error(`Unable to create user: ${JSON.stringify(error)}`);
    }
  }

  async update({ id, ...data }: UpdateUserDto) {
    try {
      const response = await this.userRepository.findByIdAndUpdate(id, data);

      if (response) {
        this.logger.log(`Updated user with id: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Unable to update user: ${JSON.stringify(error)}`);
    }
  }

  async delete({ id }: DeleteUserDto) {
    try {
      const response = await this.userRepository.findByIdAndDelete(id);

      if (response) {
        this.logger.log(`Deleted user with id: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Unable to delete user: ${JSON.stringify(error)}`);
    }
  }
}
