import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { AUTH_NAMESPACE } from 'src/common/constants/auth-namespace.constant';
import { decodeJwtPayload } from 'src/common/helpers/decodeJwtPayload.helper';

export const UserId = createParamDecorator(function (
  data: unknown,
  ctx: ExecutionContext,
) {
  const request = ctx.switchToHttp().getRequest();

  try {
    const token = request.headers.authorization;
    const parsedPayload = decodeJwtPayload(token);
    const userId = parsedPayload[AUTH_NAMESPACE];

    if (!userId) {
      throw new UnauthorizedException();
    }

    return userId;
  } catch (error) {
    throw new UnauthorizedException();
  }
});
