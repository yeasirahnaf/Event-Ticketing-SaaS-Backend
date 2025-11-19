import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminStatusDto,
  CreateUserDto,
  AdminQueryDto,
  CreateTask3UserDto,
  UpdateUserStatusDto,
} from './superadmin.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  createAdmin(createAdminDto: CreateAdminDto) {
    return {
      message: 'Admin created successfully',
      data: {
        id: 'admin_001',
        name: createAdminDto.name,
        email: createAdminDto.email,
        tenantId: createAdminDto.tenantId,
        phone: createAdminDto.phone,
        role: createAdminDto.role,
        gender: createAdminDto.gender,
        nidNumber: createAdminDto.nidNumber,
        nidImageUrl: createAdminDto.nidImageUrl ?? null,
        status: createAdminDto.status ?? 'active',
        permissions: createAdminDto.permissions ?? [
          'manage-events',
          'manage-users',
          'view-reports',
        ],
        address: {
          line1: createAdminDto.addressLine1 ?? 'House 10, Road 12',
          line2: createAdminDto.addressLine2 ?? 'Sector 11',
          city: createAdminDto.city ?? 'Dhaka',
          country: createAdminDto.country ?? 'Bangladesh',
        },
      },
    };
  }

  getAllAdmins(query: AdminQueryDto) {
    const { page = 1, limit = 10, status, role, tenantId, search } = query;
    return {
      message: 'Admins retrieved successfully',
      meta: {
        page,
        limit,
        total: 2,
        filters: {
          status: status ?? null,
          role: role ?? null,
          tenantId: tenantId ?? null,
          search: search ?? null,
        },
      },
      data: [
        {
          id: 'admin_001',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim@example.xyz',
          tenantId: 'tenant_001',
          phone: '+8801711122233',
          role: 'owner',
          gender: 'male',
          nidNumber: '1234567890123',
          nidImageUrl: 'https://cdn.example.com/nid/admin_001_front.jpg',
          status: 'active',
          permissions: ['manage-events', 'manage-users', 'view-reports'],
          address: {
            line1: 'House 10, Road 12',
            line2: 'Sector 11',
            city: 'Dhaka',
            country: 'Bangladesh',
          },
        },
        {
          id: 'admin_002',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim2@example.xyz',
          tenantId: 'tenant_001',
          phone: '+8801811122233',
          role: 'admin',
          gender: 'female',
          nidNumber: '1234567890124',
          nidImageUrl: 'https://cdn.example.com/nid/admin_002_front.jpg',
          status: 'inactive',
          permissions: ['manage-events', 'view-reports'],
          address: {
            line1: 'House 7, Road 5',
            line2: 'Uttara',
            city: 'Dhaka',
            country: 'Bangladesh',
          },
        },
      ],
    };
  }

  getAdminById(id: string) {
    return {
      message: 'Admin retrieved successfully',
      data: {
        id: id,
        name: 'Iftekhar Tasnim',
        email: 'iftekhar.tasnim@example.xyz',
        status: 'active',
        tenantId: 'tenant_001',
        phone: '+8801711122233',
        role: 'owner',
        gender: 'male',
        nidNumber: '1234567890123',
        nidImageUrl: 'https://cdn.example.com/nid/admin_001_front.jpg',
        permissions: ['manage-events', 'manage-users', 'view-reports'],
        address: {
          line1: 'House 10, Road 12',
          line2: 'Sector 11',
          city: 'Dhaka',
          country: 'Bangladesh',
        },
      },
    };
  }

  updateAdmin(id: string, updateAdminDto: UpdateAdminDto) {
    return {
      message: 'Admin updated successfully',
      data: {
        id: id,
        name: updateAdminDto.name,
        email: updateAdminDto.email,
        tenantId: updateAdminDto.tenantId,
        phone: updateAdminDto.phone,
        role: updateAdminDto.role,
        gender: updateAdminDto.gender,
        nidNumber: updateAdminDto.nidNumber,
        nidImageUrl: updateAdminDto.nidImageUrl,
        status: updateAdminDto.status,
        permissions: updateAdminDto.permissions,
        address: {
          line1: updateAdminDto.addressLine1,
          line2: updateAdminDto.addressLine2,
          city: updateAdminDto.city,
          country: updateAdminDto.country,
        },
      },
    };
  }

  updateAdminStatus(id: string, updateStatusDto: UpdateAdminStatusDto) {
    return {
      message: 'Admin status updated successfully',
      data: {
        id: id,
        status: updateStatusDto.status,
      },
    };
  }

  deleteAdmin(id: string) {
    return {
      message: 'Admin deleted successfully',
      data: {
        id: id,
      },
    };
  }

  createUser(createUserDto: CreateUserDto) {
    return {
      message: 'User created successfully',
      data: {
        id: 'user_001',
        name: createUserDto.name,
        email: createUserDto.email,
        tenantId: createUserDto.tenantId,
        phone: createUserDto.phone,
        role: createUserDto.role,
      },
    };
  }

  getAllUsers(query: AdminQueryDto) {
    const { page = 1, limit = 10, tenantId, search } = query;
    return {
      message: 'Users retrieved successfully',
      meta: {
        page,
        limit,
        total: 2,
        filters: {
          tenantId: tenantId ?? null,
          search: search ?? null,
        },
      },
      data: [
        {
          id: 'user_001',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim@example.xyz',
          tenantId: 'tenant_001',
          phone: '+8801777788899',
          role: 'admin',
        },
        {
          id: 'user_002',
          name: 'Iftekhar Tasnim',
          email: 'iftekhar.tasnim2@example.xyz',
          tenantId: 'tenant_002',
          phone: '+8801999988899',
          role: 'staff',
        },
      ],
    };
  }

  saveAdminNidImage(id: string, file: Express.Multer.File) {
    return {
      message: 'NID image uploaded successfully',
      data: {
        adminId: id,
        file: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      },
    };
  }

  // Task3 User operations
  async createTask3User(
    createUserDto: CreateTask3UserDto,
  ): Promise<UserEntity> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async updateUserStatus(
    id: number,
    updateStatusDto: UpdateUserStatusDto,
  ): Promise<UserEntity> {
    await this.userRepository.update(id, { status: updateStatusDto.status });
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async getInactiveUsers(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { status: 'inactive' },
    });
  }

  async getUsersOlderThan40(): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { age: MoreThan(40) },
    });
  }
}
