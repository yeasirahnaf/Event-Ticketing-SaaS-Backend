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
  UseGuards,
} from '@nestjs/common';
import { TenantAdminService } from './tenant-admin.service';
import {
  createEventsDto,
  EventSessionsDto,
  CreateTicketsDto,
  DiscountCodesDto,
  OrdersDto,
  TicketsDto,
  InviteStaffDto,
  UpdateStaffDto,
  UpdateStaffStatusDto,
  UpdateTenantBrandingDto,
} from './tenant-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { TenantUserEntity } from '../admin/tenant-user.entity';
import { TenantEntity } from '../admin/tenant.entity';

@Controller('tenant-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TenantAdmin')
export class TenantAdminController {
  constructor(private readonly tenantAdminService: TenantAdminService) {}

/*
  @Post('events')
  async createEvent(
    @CurrentUser() user: JwtPayload,
    @Body() createEventsDto: createEventsDto,
  ) {
    // Ensure tenant_id comes from authenticated user, not DTO
    // Map tenantId (camelCase) to tenant_id (snake_case) for entity
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tenantId, ...rest } = createEventsDto;
    return await this.tenantAdminService.createEvent({
      ...rest,
      tenant_id: user.tenantId!,
    });
  }

  @Get('events')
  async getAllEvents(@CurrentUser() user: JwtPayload) {
    return await this.tenantAdminService.getAllEvents(user.tenantId!);
  }

  @Get('events/:eventId')
  async getEventById(
    @CurrentUser() user: JwtPayload,
    @Param('eventId') eventId: string,
  ) {
    return await this.tenantAdminService.getEventById(user.tenantId!, eventId);
  }

  @Put('events/:eventId')
  async updateEvent(
    @CurrentUser() user: JwtPayload,
    @Param('eventId') eventId: string,
    @Body() updateEventsDto: Partial<createEventsDto>,
  ) {
    return await this.tenantAdminService.updateEvent(
      user.tenantId!,
      eventId,
      updateEventsDto,
    );
  }

  @Delete('events/:eventId')
  async deleteEvent(
    @CurrentUser() user: JwtPayload,
    @Param('eventId') eventId: string,
  ) {
    return await this.tenantAdminService.deleteEvent(user.tenantId!, eventId);
  }
*/

  @Post('event-sessions')
  async createEventSession(
    @CurrentUser() user: JwtPayload,
    @Body() eventSessionDto: EventSessionsDto,
  ) {
    return await this.tenantAdminService.createEventSession(
      user.tenantId!,
      eventSessionDto,
    );
  }

  @Get('events/:eventId/sessions')
  async getEventSessions(
    @CurrentUser() user: JwtPayload,
    @Param('eventId') eventId: string,
  ) {
    return await this.tenantAdminService.getEventSessions(
      user.tenantId!,
      eventId,
    );
  }

  @Get('event-sessions/:sessionId')
  async getEventSessionById(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return await this.tenantAdminService.getEventSessionById(
      user.tenantId!,
      sessionId,
    );
  }

  @Put('event-sessions/:sessionId')
  async updateEventSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
    @Body() updateSessionDto: Partial<EventSessionsDto>,
  ) {
    return await this.tenantAdminService.updateEventSession(
      user.tenantId!,
      sessionId,
      updateSessionDto,
    );
  }

  @Delete('event-sessions/:sessionId')
  async deleteEventSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return await this.tenantAdminService.deleteEventSession(
      user.tenantId!,
      sessionId,
    );
  }

  @Post('ticket-types')
  async createTicketType(
    @CurrentUser() user: JwtPayload,
    @Body() createTicketDto: CreateTicketsDto,
  ) {
    return await this.tenantAdminService.createTicketType(
      user.tenantId!,
      createTicketDto,
    );
  }

  @Get('events/:eventId/ticket-types')
  async getTicketTypes(
    @CurrentUser() user: JwtPayload,
    @Param('eventId') eventId: string,
  ) {
    return await this.tenantAdminService.getTicketTypes(
      user.tenantId!,
      eventId,
    );
  }

  @Get('ticket-types/:ticketTypeId')
  async getTicketTypeById(
    @CurrentUser() user: JwtPayload,
    @Param('ticketTypeId') ticketTypeId: string,
  ) {
    return await this.tenantAdminService.getTicketTypeById(
      user.tenantId!,
      ticketTypeId,
    );
  }

  @Put('ticket-types/:ticketTypeId')
  async updateTicketType(
    @CurrentUser() user: JwtPayload,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() updateTicketDto: Partial<CreateTicketsDto>,
  ) {
    return await this.tenantAdminService.updateTicketType(
      user.tenantId!,
      ticketTypeId,
      updateTicketDto,
    );
  }

  @Delete('ticket-types/:ticketTypeId')
  async deleteTicketType(
    @CurrentUser() user: JwtPayload,
    @Param('ticketTypeId') ticketTypeId: string,
  ) {
    return await this.tenantAdminService.deleteTicketType(
      user.tenantId!,
      ticketTypeId,
    );
  }

  @Post('discount-codes')
  async createDiscountCode(
    @CurrentUser() user: JwtPayload,
    @Body() discountCodeDto: DiscountCodesDto,
  ) {
    return await this.tenantAdminService.createDiscountCode(
      user.tenantId!,
      discountCodeDto,
    );
  }

  @Get('events/:eventId/discount-codes')
  async getDiscountCodes(
    @CurrentUser() user: JwtPayload,
    @Param('eventId') eventId: string,
  ) {
    return await this.tenantAdminService.getDiscountCodes(
      user.tenantId!,
      eventId,
    );
  }

  @Get('discount-codes/:discountCodeId')
  async getDiscountCodeById(
    @CurrentUser() user: JwtPayload,
    @Param('discountCodeId') discountCodeId: string,
  ) {
    return await this.tenantAdminService.getDiscountCodeById(
      user.tenantId!,
      discountCodeId,
    );
  }

  @Get('discount-codes/code/:code')
  async getDiscountCodeByCode(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    return await this.tenantAdminService.getDiscountCodeByCode(
      user.tenantId!,
      code,
    );
  }

  @Put('discount-codes/:discountCodeId')
  async updateDiscountCode(
    @CurrentUser() user: JwtPayload,
    @Param('discountCodeId') discountCodeId: string,
    @Body() updateDiscountDto: Partial<DiscountCodesDto>,
  ) {
    return await this.tenantAdminService.updateDiscountCode(
      user.tenantId!,
      discountCodeId,
      updateDiscountDto,
    );
  }

  @Delete('discount-codes/:discountCodeId')
  async deleteDiscountCode(
    @CurrentUser() user: JwtPayload,
    @Param('discountCodeId') discountCodeId: string,
  ) {
    return await this.tenantAdminService.deleteDiscountCode(
      user.tenantId!,
      discountCodeId,
    );
  }

  @Post('orders')
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() ordersDto: OrdersDto,
  ) {
    return await this.tenantAdminService.createOrder(user.tenantId!, ordersDto);
  }

  @Get('orders')
  async getOrders(
    @CurrentUser() user: JwtPayload,
    @Query('eventId') eventId?: string,
  ) {
    return await this.tenantAdminService.getOrders(user.tenantId!, eventId);
  }

  @Get('orders/:orderId')
  async getOrderById(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ) {
    return await this.tenantAdminService.getOrderById(user.tenantId!, orderId);
  }

  @Put('orders/:orderId')
  async updateOrder(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: Partial<OrdersDto>,
  ) {
    return await this.tenantAdminService.updateOrder(
      user.tenantId!,
      orderId,
      updateOrderDto,
    );
  }

  @Delete('orders/:orderId')
  async deleteOrder(
    @CurrentUser() user: JwtPayload,
    @Param('orderId') orderId: string,
  ) {
    return await this.tenantAdminService.deleteOrder(user.tenantId!, orderId);
  }

  @Post('tickets')
  async createTicket(
    @CurrentUser() user: JwtPayload,
    @Body() ticketsDto: TicketsDto,
  ) {
    return await this.tenantAdminService.createTicket(user.tenantId!, ticketsDto);
  }

  @Get('tickets')
  async getTickets(
    @CurrentUser() user: JwtPayload,
    @Query('orderId') orderId?: string,
  ) {
    return await this.tenantAdminService.getTickets(user.tenantId!, orderId);
  }

  @Get('tickets/:ticketId')
  async getTicketById(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId') ticketId: string,
  ) {
    return await this.tenantAdminService.getTicketById(user.tenantId!, ticketId);
  }

  @Get('tickets/email/:email')
  async getTicketsByAttendeeEmail(
    @CurrentUser() user: JwtPayload,
    @Param('email') email: string,
  ) {
    return await this.tenantAdminService.getTicketsByAttendeeEmail(
      user.tenantId!,
      email,
    );
  }

  @Put('tickets/:ticketId')
  async updateTicket(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId') ticketId: string,
    @Body() updateTicketDto: Partial<TicketsDto>,
  ) {
    return await this.tenantAdminService.updateTicket(
      user.tenantId!,
      ticketId,
      updateTicketDto,
    );
  }

  @Delete('tickets/:ticketId')
  async deleteTicket(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId') ticketId: string,
  ) {
    return await this.tenantAdminService.deleteTicket(user.tenantId!, ticketId);
  }

  @Post('tickets/:ticketId/check-in')
  async checkInTicket(
    @CurrentUser() user: JwtPayload,
    @Param('ticketId') ticketId: string,
  ) {
    return await this.tenantAdminService.checkInTicket(user.tenantId!, ticketId);
  }

  @Get('events/:eventId/stats')
  async getEventStats(
    @CurrentUser() user: JwtPayload,
    @Param('eventId') eventId: string,
  ) {
    return await this.tenantAdminService.getEventStats(user.tenantId!, eventId);
  }

  /**
   * =====================================================
   * TENANT USERS MANAGEMENT (Staff Management)
   * =====================================================
   */

  @Post('tenant-users')
  async inviteStaff(
    @CurrentUser() user: JwtPayload,
    @Body() inviteStaffDto: InviteStaffDto,
  ): Promise<TenantUserEntity> {
    return await this.tenantAdminService.inviteStaff(
      user.tenantId!,
      inviteStaffDto,
    );
  }

  @Get('tenant-users')
  async getAllStaff(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: TenantUserEntity[]; total: number; page: number }> {
    return await this.tenantAdminService.getAllStaff(
      user.tenantId!,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('tenant-users/:id')
  async getStaffById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<TenantUserEntity> {
    return await this.tenantAdminService.getStaffById(user.tenantId!, id);
  }

  @Put('tenant-users/:id')
  async updateStaff(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<TenantUserEntity> {
    return await this.tenantAdminService.updateStaff(
      user.tenantId!,
      id,
      updateStaffDto,
    );
  }

  @Patch('tenant-users/:id/status')
  async updateStaffStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStaffStatusDto,
  ): Promise<TenantUserEntity> {
    return await this.tenantAdminService.updateStaffStatus(
      user.tenantId!,
      id,
      updateStatusDto,
    );
  }

  @Delete('tenant-users/:id')
  async removeStaff(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.tenantAdminService.removeStaff(user.tenantId!, id);
    return { message: 'Staff member removed successfully' };
  }

  /**
   * =====================================================
   * TENANT BRANDING MANAGEMENT
   * =====================================================
   */

  @Get('tenant/branding')
  async getTenantBranding(
    @CurrentUser() user: JwtPayload,
  ): Promise<TenantEntity> {
    return await this.tenantAdminService.getTenantBranding(user.tenantId!);
  }

  @Put('tenant/branding')
  async updateTenantBranding(
    @CurrentUser() user: JwtPayload,
    @Body() updateBrandingDto: UpdateTenantBrandingDto,
  ): Promise<TenantEntity> {
    return await this.tenantAdminService.updateTenantBranding(
      user.tenantId!,
      updateBrandingDto,
    );
  }
}
