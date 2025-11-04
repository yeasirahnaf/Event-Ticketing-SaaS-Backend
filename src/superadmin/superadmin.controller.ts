import { Body, Controller, Post } from '@nestjs/common';
import { CreateAdminDto } from './superadmin.dto';
import { SuperAdminService } from './superadmin.service';

@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly superadminservice: SuperAdminService) {}

  @Post('create')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return await this.superadminservice.create(createAdminDto);
  }
}
