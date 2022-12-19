import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMemberDto } from './dto/create-member.dto';
import { DeleteMemberDto } from './dto/delete-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersQueue } from './enums/members-queue.enum';
import { MembersRoutingKey } from './enums/members-routing-schema.enum';
import { Member, MemberDocument } from './schemas/member.schema';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberRepository: Model<MemberDocument>,
  ) {}
  private readonly logger = new Logger(MembersService.name);

  async getMemberByServer(userId: string, serverId: string) {
    const member = await this.memberRepository.findOne({ userId, serverId });

    if (!member) {
      throw new NotFoundException('member not found');
    }

    return member;
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: MembersRoutingKey.CREATE,
    queue: MembersQueue.CREATE,
  })
  @UsePipes(ValidationPipe)
  async create({ userId, serverId, roles, version }: CreateMemberDto) {
    try {
      const member = new this.memberRepository({
        userId,
        serverId,
        roles,
        version,
      });

      await member.save();
      this.logger.log(
        `Created member with id: ${userId} and serverId: ${serverId}`,
      );
    } catch (error) {
      this.logger.error(`Unable to create member: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: MembersRoutingKey.UPDATE,
    queue: MembersQueue.UPDATE,
  })
  @UsePipes(ValidationPipe)
  async update({ userId, serverId, roles, version }: UpdateMemberDto) {
    try {
      const response = await this.memberRepository.updateOne(
        { userId, serverId },
        [
          {
            $set: {
              roles: {
                $cond: [{ $gt: [version, '$version'] }, roles, '$roles'],
              },
            },
          },
          {
            $set: {
              version: {
                $cond: [{ $gt: [version, '$version'] }, version, '$version'],
              },
            },
          },
        ],
      );

      if (response.modifiedCount >= 0) {
        this.logger.log(
          `Updated member with id: ${userId} and serverId: ${serverId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Unable to update member: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: MembersRoutingKey.DELETE,
    queue: MembersQueue.DELETE,
  })
  async delete({ userId, serverId }: DeleteMemberDto) {
    try {
      const response = await this.memberRepository.deleteOne({
        userId,
        serverId,
      });

      if (response.deletedCount >= 0) {
        this.logger.log(
          `Deleted member with id: ${userId} and serverId: ${serverId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Unable to delete member: ${JSON.stringify(error)}`);
      new Nack();
    }
  }
}
