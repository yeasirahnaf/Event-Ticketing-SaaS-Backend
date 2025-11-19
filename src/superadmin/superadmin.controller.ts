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
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError } from 'multer';
import {
  CreateAdminDto,
  UpdateAdminDto,
  UpdateAdminStatusDto,
  CreateUserDto,
  AdminQueryDto,
  CreateTask3UserDto,
  UpdateUserStatusDto,
} from './superadmin.dto';
import { SuperAdminService } from './superadmin.service';

@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('admins')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.superAdminService.createAdmin(createAdminDto);
  }

  @Get('admins')
  getAllAdmins(@Query() query: AdminQueryDto) {
    return this.superAdminService.getAllAdmins(query);
  }

  @Get('admins/:id')
  getAdminById(@Param('id') id: string) {
    return this.superAdminService.getAdminById(id);
  }

  @Put('admins/:id')
  updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.superAdminService.updateAdmin(id, updateAdminDto);
  }

  @Patch('admins/:id/status')
  updateAdminStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAdminStatusDto,
  ) {
    return this.superAdminService.updateAdminStatus(id, updateStatusDto);
  }

  @Delete('admins/:id')
  deleteAdmin(@Param('id') id: string) {
    return this.superAdminService.deleteAdmin(id);
  }

  @Post('admins/:id/nid-image')
  @UseInterceptors(
    FileInterceptor('nid', {
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(jpg|jpeg|png|webp)$/i)) {
          cb(null, true);
        } else {
          cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'nid'), false);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadNidImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.superAdminService.saveAdminNidImage(id, file);
  }

  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.superAdminService.createUser(createUserDto);
  }

  @Get('users')
  getAllUsers(@Query() query: AdminQueryDto) {
    return this.superAdminService.getAllUsers(query);
  }

  // Task3 User endpoints
  @Post('task3/users')
  @UsePipes(new ValidationPipe())
  createTask3User(@Body() createUserDto: CreateTask3UserDto) {
    return this.superAdminService.createTask3User(createUserDto);
  }

  @Patch('task3/users/:id/status')
  @UsePipes(new ValidationPipe())
  updateUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    return this.superAdminService.updateUserStatus(id, updateStatusDto);
  }

  @Get('task3/users/inactive')
  getInactiveUsers() {
    return this.superAdminService.getInactiveUsers();
  }

  @Get('task3/users/older-than-40')
  getUsersOlderThan40() {
    return this.superAdminService.getUsersOlderThan40();
  }
}
