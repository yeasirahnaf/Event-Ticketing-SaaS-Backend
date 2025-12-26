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
  UseGuards,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards to all admin routes
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Public endpoint for Admin Registration
  @Public()
  @Post('register')
  @UsePipes(new ValidationPipe())
  async registerAdmin(@Body() createAdminDto: any) { // Type should be CreateAdminDto but importing to avoid circular dep issues quickly
     return this.adminService.registerAdmin(createAdminDto);
  }

  // User endpoints (Platform Users) - Platform Admin only
  @Get('stats')
  @Roles('platform_admin')
  getStats() {
    return this.adminService.getStats();
  }

  @Post('users')
  @Roles('platform_admin')
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users')
  @Roles('platform_admin')
  @UsePipes(new ValidationPipe())
  getAllUsers(@Query() query: UserQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @Get('users/:id')
  @Roles('platform_admin')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @Roles('platform_admin')
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @Roles('platform_admin')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Tenant endpoints - Platform Admin only
  @Post('tenants')
  @Roles('platform_admin')
  @UsePipes(new ValidationPipe())
  createTenant(@Body() createTenantDto: CreateTenantDto) {
    return this.adminService.createTenant(createTenantDto);
  }

  @Get('tenants')
  @Roles('platform_admin')
  @UsePipes(new ValidationPipe())
  getAllTenants(@Query() query: TenantQueryDto) {
    return this.adminService.getAllTenants(query);
  }

  @Get('tenants/:id')
  @Roles('platform_admin')
  getTenantById(@Param('id') id: string) {
    return this.adminService.getTenantById(id);
  }

  @Put('tenants/:id')
  @Roles('platform_admin')
  @UsePipes(new ValidationPipe())
  updateTenant(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.adminService.updateTenant(id, updateTenantDto);
  }

  @Patch('tenants/:id/status')
  @Roles('platform_admin')
  @UsePipes(new ValidationPipe())
  updateTenantStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTenantStatusDto,
  ) {
    return this.adminService.updateTenantStatus(id, updateStatusDto);
  }

  @Delete('tenants/:id')
  @Roles('platform_admin')
  deleteTenant(@Param('id') id: string) {
    return this.adminService.deleteTenant(id);
  }

  // Tenant User endpoints - Platform Admin and TenantAdmin
  @Post('tenant-users')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  createTenantUser(@Body() createTenantUserDto: CreateTenantUserDto) {
    return this.adminService.createTenantUser(createTenantUserDto);
  }

  @Get('tenant-users')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  getAllTenantUsers(@Query() query: TenantUserQueryDto) {
    return this.adminService.getAllTenantUsers(query);
  }

  @Get('tenant-users/:id')
  @Roles('platform_admin', 'TenantAdmin')
  getTenantUserById(@Param('id') id: string) {
    return this.adminService.getTenantUserById(id);
  }

  @Put('tenant-users/:id')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  updateTenantUser(
    @Param('id') id: string,
    @Body() updateTenantUserDto: UpdateTenantUserDto,
  ) {
    return this.adminService.updateTenantUser(id, updateTenantUserDto);
  }

  @Patch('tenant-users/:id/status')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  updateTenantUserStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTenantUserStatusDto,
  ) {
    return this.adminService.updateTenantUserStatus(id, updateStatusDto);
  }

  @Delete('tenant-users/:id')
  @Roles('platform_admin', 'TenantAdmin')
  deleteTenantUser(@Param('id') id: string) {
    return this.adminService.deleteTenantUser(id);
  }

  // Webhook Event endpoints - Platform Admin and TenantAdmin
  @Post('webhook-events')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  createWebhookEvent(@Body() createWebhookEventDto: CreateWebhookEventDto) {
    return this.adminService.createWebhookEvent(createWebhookEventDto);
  }

  @Get('webhook-events')
  @Roles('platform_admin', 'TenantAdmin', 'staff')
  @UsePipes(new ValidationPipe())
  getAllWebhookEvents(@Query() query: WebhookEventQueryDto) {
    return this.adminService.getAllWebhookEvents(query);
  }

  @Get('webhook-events/:id')
  @Roles('platform_admin', 'TenantAdmin', 'staff')
  getWebhookEventById(@Param('id') id: string) {
    return this.adminService.getWebhookEventById(id);
  }

  @Put('webhook-events/:id')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  updateWebhookEvent(
    @Param('id') id: string,
    @Body() updateWebhookEventDto: UpdateWebhookEventDto,
  ) {
    return this.adminService.updateWebhookEvent(id, updateWebhookEventDto);
  }

  @Patch('webhook-events/:id/status')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  updateWebhookEventStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateWebhookEventStatusDto,
  ) {
    return this.adminService.updateWebhookEventStatus(id, updateStatusDto);
  }

  @Delete('webhook-events/:id')
  @Roles('platform_admin', 'TenantAdmin')
  deleteWebhookEvent(@Param('id') id: string) {
    return this.adminService.deleteWebhookEvent(id);
  }

  // Payment endpoints - Platform Admin and TenantAdmin
  @Post('payments')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.adminService.createPayment(createPaymentDto);
  }

  @Get('payments')
  @Roles('platform_admin', 'TenantAdmin', 'staff')
  @UsePipes(new ValidationPipe())
  getAllPayments(@Query() query: PaymentQueryDto) {
    return this.adminService.getAllPayments(query);
  }

  @Get('payments/:id')
  @Roles('platform_admin', 'TenantAdmin', 'staff')
  getPaymentById(@Param('id') id: string) {
    return this.adminService.getPaymentById(id);
  }

  @Put('payments/:id')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.adminService.updatePayment(id, updatePaymentDto);
  }

  @Patch('payments/:id/status')
  @Roles('platform_admin', 'TenantAdmin')
  @UsePipes(new ValidationPipe())
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.adminService.updatePaymentStatus(id, updateStatusDto);
  }

  @Delete('payments/:id')
  @Roles('platform_admin', 'TenantAdmin')
  deletePayment(@Param('id') id: string) {
    return this.adminService.deletePayment(id);
  }

  // Activity Log endpoints - All authenticated roles (read), Platform Admin and TenantAdmin (write)
  @Post('activity-logs')
  @Roles('platform_admin', 'TenantAdmin', 'staff')
  @UsePipes(new ValidationPipe())
  createActivityLog(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.adminService.createActivityLog(createActivityLogDto);
  }

  @Get('activity-logs')
  @Roles('platform_admin', 'TenantAdmin', 'staff')
  @UsePipes(new ValidationPipe())
  getAllActivityLogs(@Query() query: ActivityLogQueryDto) {
    return this.adminService.getAllActivityLogs(query);
  }

  @Get('activity-logs/:id')
  @Roles('platform_admin', 'TenantAdmin', 'staff')
  getActivityLogById(@Param('id') id: string) {
    return this.adminService.getActivityLogById(id);
  }

  @Delete('activity-logs/:id')
  @Roles('platform_admin', 'TenantAdmin')
  deleteActivityLog(@Param('id') id: string) {
    return this.adminService.deleteActivityLog(id);
  }
}
