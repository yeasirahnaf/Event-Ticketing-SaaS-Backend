import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminStatusDto,
  CreateUserDto,
} from './superadmin.dto';
import { SuperAdminService } from './superadmin.service';

@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly superadminservice: SuperAdminService) {}

  // Route 1: POST - Create a new admin
  @Post('admins')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.superadminservice.createAdmin(createAdminDto);
  }

  // Route 2: GET - Get all admins with query parameters
  @Get('admins')
  getAllAdmins(@Query() query: any) {
    return this.superadminservice.getAllAdmins(query);
  }

  // Route 3: GET - Get admin by ID using path parameter
  @Get('admins/:id')
  getAdminById(@Param('id') id: string) {
    return this.superadminservice.getAdminById(id);
  }

  // Route 4: PUT - Update entire admin record
  @Put('admins/:id')
  updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.superadminservice.updateAdmin(id, updateAdminDto);
  }

  // Route 5: PATCH - Partial update admin status
  @Patch('admins/:id/status')
  updateAdminStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAdminStatusDto,
  ) {
    return this.superadminservice.updateAdminStatus(id, updateStatusDto);
  }

  // Route 6: DELETE - Delete an admin
  @Delete('admins/:id')
  deleteAdmin(@Param('id') id: string) {
    return this.superadminservice.deleteAdmin(id);
  }

  // Route 7: POST - Create a user
  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.superadminservice.createUser(createUserDto);
  }

  // Route 8: GET - Get all users with query parameters
  @Get('users')
  getAllUsers(@Query() query: any) {
    return this.superadminservice.getAllUsers(query);
  }
}
