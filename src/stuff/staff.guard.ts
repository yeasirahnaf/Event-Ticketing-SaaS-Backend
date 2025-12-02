import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // Check if user has staff role (lowercase 'staff' as per auth.service.ts)
    // Also allow platform admin and TenantAdmin to manage staff
    if (
      user.role !== 'staff' &&
      user.role !== 'TenantAdmin' &&
      !user.isPlatformAdmin &&
      user.role !== 'platform_admin'
    ) {
      throw new ForbiddenException('Only staff members, tenant admins, or platform admins can access this resource');
    }

    return true;
  }
}
