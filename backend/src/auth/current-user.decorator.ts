import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from './jwt.strategy';

/**
 * Pulls the user attached by JwtStrategy.validate() onto the request,
 * so controllers can do `@CurrentUser() user: AuthenticatedUser`
 * instead of reaching into `req.user` manually.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
