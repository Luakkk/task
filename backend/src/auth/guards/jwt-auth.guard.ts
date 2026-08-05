import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Applied to every route/gateway that isn't /auth/*.
 * Delegates to the 'jwt' passport strategy (see jwt.strategy.ts).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
