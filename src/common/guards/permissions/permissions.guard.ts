import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ChannelsService } from '../../../channels/channels.service';
import { MembersService } from '../../../members/members.service';
import { Permission } from './permission.enum';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private membersService: MembersService,
    private channelsService: ChannelsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const {
      userId,
      params: { channelId },
      query: { serverId: serverIdFromQuery },
      body: { serverId: serverIdFromBody },
    } = request;

    if (serverIdFromQuery) {
      return this.verifyPermissions(
        requiredPermissions,
        userId,
        serverIdFromQuery,
      );
    }

    if (serverIdFromBody) {
      return this.verifyPermissions(
        requiredPermissions,
        userId,
        serverIdFromBody,
      );
    }

    if (!channelId) {
      return false;
    }

    const { serverId, userIds } = await this.channelsService.getChannelById(
      channelId,
    );

    if (!serverId) {
      return userIds.some((user) => user === userId);
    }

    return this.verifyPermissions(requiredPermissions, userId, serverId);
  }

  async verifyPermissions(
    requiredPermissions: Permission[],
    userId: string,
    serverId: string,
  ) {
    const permissions = await this.membersService.getMemberPermissions(
      userId,
      serverId,
    );

    return requiredPermissions.some((permission) =>
      permissions.includes(permission),
    );
  }
}
