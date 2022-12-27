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
import { CreateRoleDto } from './dto/create-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesQueue } from './enums/roles-queue.enum';
import { RolesRoutingKey } from './enums/roles-routing-key.enum';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleRepository: Model<RoleDocument>,
  ) {}
  private readonly logger = new Logger(RolesService.name);

  async getRoleById(roleId: string) {
    const role = await this.roleRepository.findOne({ roleId });

    if (!role) {
      throw new NotFoundException('role not found');
    }

    return role;
  }

  async getMultipleRolesByIds(roleIds: string[]) {
    const roles = await this.roleRepository.find({ roleId: { $in: roleIds } });

    return roles;
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: RolesRoutingKey.CREATE,
    queue: RolesQueue.CREATE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(RolesQueue.CREATE))
  async create({ id, permissions, version, versionHash }: CreateRoleDto) {
    try {
      const role = new this.roleRepository({
        permissions,
        version,
        roleId: id,
        versionHash,
      });

      await role.save();
      this.logger.log(`Created role with id: ${id}`);
    } catch (error) {
      this.logger.error(`Unable to create role: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: RolesRoutingKey.UPDATE,
    queue: RolesQueue.UPDATE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(RolesQueue.UPDATE))
  async update({ id, version, permissions, versionHash }: UpdateRoleDto) {
    try {
      const role = await this.roleRepository.findOne({
        roleId: id,
        version: version - 1,
      });

      if (!role) {
        return new Nack();
      }

      role.permissions = permissions;
      role.versionHash = versionHash;

      await role.save();

      this.logger.log(`Updated role with id: ${id}`);
    } catch (error) {
      this.logger.error(`Unable to update role: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE_NAME,
    routingKey: RolesRoutingKey.DELETE,
    queue: RolesQueue.DELETE,
    queueOptions: {
      deadLetterExchange: DEAD_LETTER_EXCHANGE_NAME,
    },
  })
  @UseInterceptors(DLQRetryCheckerInterceptor(RolesQueue.DELETE))
  async delete({ id }: DeleteRoleDto) {
    try {
      await this.roleRepository.findOneAndDelete({ roleId: id });

      this.logger.log(`Deleted role with id: ${id}`);
    } catch (error) {
      this.logger.error(`Unable to delete role: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }
}
