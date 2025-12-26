import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export type UserRole = 'platform_admin' | 'TenantAdmin' | 'staff' | null;

export interface JwtPayload {
  sub: string;
  email: string;
  isPlatformAdmin: boolean;
  role: UserRole;
  tenantId?: string;
  tenantRole?: 'TenantAdmin' | 'staff';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    // Find user by email
    const user = await this.adminService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare password with bcrypt
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Restriction: Only allow Platform Admins to login via this endpoint
    if (!user.isPlatformAdmin) {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }

    // Determine user role and tenant information
    let role: UserRole = null;
    let tenantId: string | undefined;
    let tenantRole: 'TenantAdmin' | 'staff' | undefined;

    // Check if user is platform admin
    if (user.isPlatformAdmin) {
      role = 'platform_admin';
    } else {
      // Fetch active tenant roles for the user
      const tenantUsers = await this.adminService.findActiveTenantUsersByUserId(
        user.id,
      );

      if (tenantUsers.length > 0) {
        // Use the first active tenant role (most recent by createdAt DESC)
        // Priority: TenantAdmin > staff
        const tenantAdmin = tenantUsers.find((tu) => tu.role === 'TenantAdmin');
        const activeTenantUser = tenantAdmin || tenantUsers[0];

        role = activeTenantUser.role as 'TenantAdmin' | 'staff';
        tenantId = activeTenantUser.tenantId;
        tenantRole = activeTenantUser.role as 'TenantAdmin' | 'staff';
      }
    }

    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
      role,
      ...(tenantId && { tenantId }),
      ...(tenantRole && { tenantRole }),
    };

    // Generate and return token
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
