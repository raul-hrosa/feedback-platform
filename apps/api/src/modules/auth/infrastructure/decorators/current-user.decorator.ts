import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

export function extractCurrentUser(_data: unknown, ctx: ExecutionContext): AuthenticatedUser {
  return ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user;
}

export const CurrentUser = createParamDecorator(extractCurrentUser);
