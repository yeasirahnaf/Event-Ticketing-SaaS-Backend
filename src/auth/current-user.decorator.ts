import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './auth.service';

/**
 * Decorator to extract the current authenticated user from the request.
 * The user is set by JwtAuthGuard in the request.user property.
 * 
 * Usage:
 * @Get('me')
 * async getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

