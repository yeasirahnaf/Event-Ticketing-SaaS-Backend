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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateTenantDto,
  UpdateTenantDto,
  UpdateTenantStatusDto,
  CreateTenantUserDto,
  UpdateTenantUserDto,
  UpdateTenantUserStatusDto,
  CreateWebhookEventDto,
  UpdateWebhookEventDto,
  UpdateWebhookEventStatusDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  UpdatePaymentStatusDto,
  CreateActivityLogDto,
  UserQueryDto,
  TenantQueryDto,
  TenantUserQueryDto,
  WebhookEventQueryDto,
  PaymentQueryDto,
  ActivityLogQueryDto,
} from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User endpoints (Platform Users)
  @Post('users')
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users')
  @UsePipes(new ValidationPipe())
  getAllUsers(@Query() query: UserQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Tenant endpoints
  @Post('tenants')
  @UsePipes(new ValidationPipe())
  createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.adminService.createTenant(createTenantDto);
  }

  @Get('tenants')
  @UsePipes(new ValidationPipe())
  getAllTenants(@Query() query: TenantQueryDto) {
    return this.adminService.getAllTenants(query);
  }

  @Get('tenants/:id')
  getTenantById(@Param('id') id: string) {
    return this.adminService.getTenantById(id);
  }

  @Put('tenants/:id')
  @UsePipes(new ValidationPipe())
  updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.adminService.updateTenant(id, updateTenantDto);
  }

  @Patch('tenants/:id/status')
  @UsePipes(new ValidationPipe())
  updateTenantStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTenantStatusDto,
  ) {
    return this.adminService.updateTenantStatus(id, updateStatusDto);
  }

  @Delete('tenants/:id')
  deleteTenant(@Param('id') id: string) {
    return this.adminService.deleteTenant(id);
  }

  // Tenant User endpoints
  @Post('tenant-users')
  @UsePipes(new ValidationPipe())
  createTenantUser(@Body() createTenantUserDto: CreateTenantUserDto) {
    return this.adminService.createTenantUser(createTenantUserDto);
  }

  @Get('tenant-users')
  @UsePipes(new ValidationPipe())
  getAllTenantUsers(@Query() query: TenantUserQueryDto) {
    return this.adminService.getAllTenantUsers(query);
  }

  @Get('tenant-users/:id')
  getTenantUserById(@Param('id') id: string) {
    return this.adminService.getTenantUserById(id);
  }

  @Put('tenant-users/:id')
  @UsePipes(new ValidationPipe())
  updateTenantUser(
    @Param('id') id: string,
    @Body() updateTenantUserDto: UpdateTenantUserDto,
  ) {
    return this.adminService.updateTenantUser(id, updateTenantUserDto);
  }

  @Patch('tenant-users/:id/status')
  @UsePipes(new ValidationPipe())
  updateTenantUserStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTenantUserStatusDto,
  ) {
    return this.adminService.updateTenantUserStatus(id, updateStatusDto);
  }

  @Delete('tenant-users/:id')
  deleteTenantUser(@Param('id') id: string) {
    return this.adminService.deleteTenantUser(id);
  }

  // Webhook Event endpoints
  @Post('webhook-events')
  @UsePipes(new ValidationPipe())
  createWebhookEvent(@Body() createWebhookEventDto: CreateWebhookEventDto) {
    return this.adminService.createWebhookEvent(createWebhookEventDto);
  }

  @Get('webhook-events')
  @UsePipes(new ValidationPipe())
  getAllWebhookEvents(@Query() query: WebhookEventQueryDto) {
    return this.adminService.getAllWebhookEvents(query);
  }

  @Get('webhook-events/:id')
  getWebhookEventById(@Param('id') id: string) {
    return this.adminService.getWebhookEventById(id);
  }

  @Put('webhook-events/:id')
  @UsePipes(new ValidationPipe())
  updateWebhookEvent(
    @Param('id') id: string,
    @Body() updateWebhookEventDto: UpdateWebhookEventDto,
  ) {
    return this.adminService.updateWebhookEvent(id, updateWebhookEventDto);
  }

  @Patch('webhook-events/:id/status')
  @UsePipes(new ValidationPipe())
  updateWebhookEventStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateWebhookEventStatusDto,
  ) {
    return this.adminService.updateWebhookEventStatus(id, updateStatusDto);
  }

  @Delete('webhook-events/:id')
  deleteWebhookEvent(@Param('id') id: string) {
    return this.adminService.deleteWebhookEvent(id);
  }

  // Payment endpoints
  @Post('payments')
  @UsePipes(new ValidationPipe())
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.adminService.createPayment(createPaymentDto);
  }

  @Get('payments')
  @UsePipes(new ValidationPipe())
  getAllPayments(@Query() query: PaymentQueryDto) {
    return this.adminService.getAllPayments(query);
  }

  @Get('payments/:id')
  getPaymentById(@Param('id') id: string) {
    return this.adminService.getPaymentById(id);
  }

  @Put('payments/:id')
  @UsePipes(new ValidationPipe())
  updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.adminService.updatePayment(id, updatePaymentDto);
  }

  @Patch('payments/:id/status')
  @UsePipes(new ValidationPipe())
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.adminService.updatePaymentStatus(id, updateStatusDto);
  }

  @Delete('payments/:id')
  deletePayment(@Param('id') id: string) {
    return this.adminService.deletePayment(id);
  }

  // Activity Log endpoints
  @Post('activity-logs')
  @UsePipes(new ValidationPipe())
  createActivityLog(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.adminService.createActivityLog(createActivityLogDto);
  }

  @Get('activity-logs')
  @UsePipes(new ValidationPipe())
  getAllActivityLogs(@Query() query: ActivityLogQueryDto) {
    return this.adminService.getAllActivityLogs(query);
  }

  @Get('activity-logs/:id')
  getActivityLogById(@Param('id') id: string) {
    return this.adminService.getActivityLogById(id);
  }

  @Delete('activity-logs/:id')
  deleteActivityLog(@Param('id') id: string) {
    return this.adminService.deleteActivityLog(id);
  }
}

