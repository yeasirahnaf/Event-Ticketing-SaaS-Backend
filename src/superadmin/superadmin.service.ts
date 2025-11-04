import { Injectable } from '@nestjs/common';
import {
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminStatusDto,
  CreateUserDto,
} from './superadmin.dto';

@Injectable()
export class SuperAdminService {
  // Route 1: Create a new admin
  createAdmin(createAdminDto: CreateAdminDto) {
    return {
      message: 'Admin created successfully',
      data: {
        id: 'admin_001',
        name: createAdminDto.name,
        email: createAdminDto.email,
      },
    };
  }

  // Route 2: Get all admins with query parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAllAdmins(query: any) {
    return {
      message: 'Admins retrieved successfully',
      data: [
        {
          id: 'admin_001',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim@example.com',
        },
        {
          id: 'admin_002',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim2@example.com',
        },
      ],
    };
  }

  // Route 3: Get admin by ID
  getAdminById(id: string) {
    return {
      message: 'Admin retrieved successfully',
      data: {
        id: id,
        name: 'Iftekhar Tasnim',
        email: 'iftekhar.tasnim@example.com',
        status: 'active',
      },
    };
  }

  // Route 4: Update entire admin record
  updateAdmin(id: string, updateAdminDto: UpdateAdminDto) {
    return {
      message: 'Admin updated successfully',
      data: {
        id: id,
        name: updateAdminDto.name,
        email: updateAdminDto.email,
      },
    };
  }

  // Route 5: Partial update admin status
  updateAdminStatus(id: string, updateStatusDto: UpdateAdminStatusDto) {
    return {
      message: 'Admin status updated successfully',
      data: {
        id: id,
        status: updateStatusDto.status,
      },
    };
  }

  // Route 6: Delete an admin
  deleteAdmin(id: string) {
    return {
      message: 'Admin deleted successfully',
      data: {
        id: id,
      },
    };
  }

  // Route 7: Create a user
  createUser(createUserDto: CreateUserDto) {
    return {
      message: 'User created successfully',
      data: {
        id: 'user_001',
        name: createUserDto.name,
        email: createUserDto.email,
      },
    };
  }

  // Route 8: Get all users with query parameters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAllUsers(query: any) {
    return {
      message: 'Users retrieved successfully',
      data: [
        {
          id: 'user_001',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim@example.com',
        },
        {
          id: 'user_002',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim2@example.com',
        },
      ],
    };
  }
}
