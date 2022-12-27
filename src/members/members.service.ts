import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  Injectable,
  Logger,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DLQRetryCheckerInterceptor } from '../common/interceptors/dlq-retry-checker.interceptor';
import {
  DEAD_LETTER_EXCHANGE_NAME,
  DEFAULT_EXCHANGE_NAME,
} from '../config/rabbitmq.config';
import { Role } from '../roles/schemas/role.schema';
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

  async getMemberPermissions(userId: string, serverId: string) {
    const member = await this.memberRepository
      .findOne({ userId, serverId })
      .populate('roles')
      .exec();

    if (!member) {
      return [];
    }

    const permissions = member.roles.reduce((acc: string[], value: Role) => {
      return [...acc, ...value.permissions];
    }, []);

    return [...new Set(permissions)];
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: MembersRoutingKey.CREATE,
    queue: MembersQueue.CREATE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(MembersQueue.CREATE))
  async create({ userId, serverId, roles, versionHash }: CreateMemberDto) {
    try {
      const member = new this.memberRepository({
        userId,
        serverId,
        roleIds: roles,
        versionHash,
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
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: MembersRoutingKey.UPDATE,
    queue: MembersQueue.UPDATE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(MembersQueue.UPDATE))
  async update({
    userId,
    serverId,
    roles,
    version,
    versionHash,
  }: UpdateMemberDto) {
    try {
      const member = await this.memberRepository.findOne({
        serverId,
        userId,
        version: version - 1,
      });

      if (!member) {
        return new Nack();
      }

      member.roleIds = roles;
      member.versionHash = versionHash;

      this.logger.log(
        `Updated member with id: ${userId} and serverId: ${serverId}`,
      );
    } catch (error) {
      this.logger.error(`Unable to update member: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: MembersRoutingKey.DELETE,
    queue: MembersQueue.DELETE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(MembersQueue.DELETE))
  async delete({ userId, serverId }: DeleteMemberDto) {
    try {
      await this.memberRepository.findOneAndDelete({ userId, serverId });

      this.logger.log(
        `Deleted member with id: ${userId} and serverId: ${serverId}`,
      );
    } catch (error) {
      this.logger.error(`Unable to delete member: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }
}
