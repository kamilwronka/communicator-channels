import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AUTH_NAMESPACE } from '../../constants/auth-namespace.constant';
import { decodeJwtPayload } from '../../helpers/decodeJwtPayload.helper';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const token = request.headers.authorization;
      const parsedPayload = decodeJwtPayload(token);
      const userId = parsedPayload[AUTH_NAMESPACE];

      if (!userId) {
        return false;
      }

      request.userId = userId;

      return true;
    } catch (error) {
      return false;
    }
  }
}
