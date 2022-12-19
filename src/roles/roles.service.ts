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

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RolesRoutingKey.CREATE,
    queue: RolesQueue.CREATE,
  })
  @UsePipes(ValidationPipe)
  async create({ id, permissions, version }: CreateRoleDto) {
    try {
      const role = new this.roleRepository({
        permissions,
        version,
        roleId: id,
      });

      await role.save();
      this.logger.log(`Created role with id: ${id}`);
    } catch (error) {
      this.logger.error(`Unable to create role: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RolesRoutingKey.UPDATE,
    queue: RolesQueue.UPDATE,
  })
  @UsePipes(ValidationPipe)
  async update({ id, version, permissions }: UpdateRoleDto) {
    try {
      const response = await this.roleRepository.updateOne({ roleId: id }, [
        {
          $set: {
            permissions: {
              $cond: [
                { $gt: [version, '$version'] },
                permissions,
                '$permissions',
              ],
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
      ]);

      if (response.modifiedCount >= 0) {
        this.logger.log(`Updated role with id: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Unable to update role: ${JSON.stringify(error)}`);
      return new Nack();
    }
  }

  @RabbitSubscribe({
    exchange: 'default',
    routingKey: RolesRoutingKey.DELETE,
    queue: RolesQueue.DELETE,
  })
  async delete({ id }: DeleteRoleDto) {
    try {
      const response = await this.roleRepository.deleteOne({
        roleId: id,
      });

      if (response.deletedCount > 0) {
        this.logger.log(`Deleted role with id: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Unable to delete role: ${JSON.stringify(error)}`);
      new Nack();
    }
  }
}
