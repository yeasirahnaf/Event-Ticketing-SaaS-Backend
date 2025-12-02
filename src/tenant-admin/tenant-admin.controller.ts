import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { TenantAdminService } from './tenant-admin.service';
import {
  createEventsDto,
  EventSessionsDto,
  CreateTicketsDto,
  DiscountCodesDto,
  OrdersDto,
  TicketsDto,
} from './tenant-admin.dto';

@Controller('tenant-admin')
export class TenantAdminController {
  constructor(private readonly tenantAdminService: TenantAdminService) {}

  @Post('events')
  async createEvent(@Body() createEventsDto: createEventsDto) {
    return await this.tenantAdminService.createEvent(createEventsDto);
  }

  @Get('events')
  async getAllEvents(@Query('tenantId') tenantId: string) {
    return await this.tenantAdminService.getAllEvents(tenantId);
  }

  @Get('events/:eventId')
  async getEventById(@Param('eventId') eventId: string) {
    return await this.tenantAdminService.getEventById(eventId);
  }

  @Put('events/:eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() updateEventsDto: Partial<createEventsDto>,
  ) {
    return await this.tenantAdminService.updateEvent(eventId, updateEventsDto);
  }

  @Delete('events/:eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    return await this.tenantAdminService.deleteEvent(eventId);
  }

  @Post('event-sessions')
  async createEventSession(@Body() eventSessionDto: EventSessionsDto) {
    return await this.tenantAdminService.createEventSession(eventSessionDto);
  }

  @Get('events/:eventId/sessions')
  async getEventSessions(@Param('eventId') eventId: string) {
    return await this.tenantAdminService.getEventSessions(eventId);
  }

  @Get('event-sessions/:sessionId')
  async getEventSessionById(@Param('sessionId') sessionId: string) {
    return await this.tenantAdminService.getEventSessionById(sessionId);
  }

  @Put('event-sessions/:sessionId')
  async updateEventSession(
    @Param('sessionId') sessionId: string,
    @Body() updateSessionDto: Partial<EventSessionsDto>,
  ) {
    return await this.tenantAdminService.updateEventSession(
      sessionId,
      updateSessionDto,
    );
  }

  @Delete('event-sessions/:sessionId')
  async deleteEventSession(@Param('sessionId') sessionId: string) {
    return await this.tenantAdminService.deleteEventSession(sessionId);
  }

  @Post('ticket-types')
  async createTicketType(@Body() createTicketDto: CreateTicketsDto) {
    return await this.tenantAdminService.createTicketType(createTicketDto);
  }

  @Get('events/:eventId/ticket-types')
  async getTicketTypes(@Param('eventId') eventId: string) {
    return await this.tenantAdminService.getTicketTypes(eventId);
  }

  @Get('ticket-types/:ticketTypeId')
  async getTicketTypeById(@Param('ticketTypeId') ticketTypeId: string) {
    return await this.tenantAdminService.getTicketTypeById(ticketTypeId);
  }

  @Put('ticket-types/:ticketTypeId')
  async updateTicketType(
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() updateTicketDto: Partial<CreateTicketsDto>,
  ) {
    return await this.tenantAdminService.updateTicketType(
      ticketTypeId,
      updateTicketDto,
    );
  }

  @Delete('ticket-types/:ticketTypeId')
  async deleteTicketType(@Param('ticketTypeId') ticketTypeId: string) {
    return await this.tenantAdminService.deleteTicketType(ticketTypeId);
  }

  @Post('discount-codes')
  async createDiscountCode(@Body() discountCodeDto: DiscountCodesDto) {
    return await this.tenantAdminService.createDiscountCode(discountCodeDto);
  }

  @Get('events/:eventId/discount-codes')
  async getDiscountCodes(@Param('eventId') eventId: string) {
    return await this.tenantAdminService.getDiscountCodes(eventId);
  }

  @Get('discount-codes/:discountCodeId')
  async getDiscountCodeById(@Param('discountCodeId') discountCodeId: string) {
    return await this.tenantAdminService.getDiscountCodeById(discountCodeId);
  }

  @Get('discount-codes/code/:code')
  async getDiscountCodeByCode(@Param('code') code: string) {
    return await this.tenantAdminService.getDiscountCodeByCode(code);
  }

  @Put('discount-codes/:discountCodeId')
  async updateDiscountCode(
    @Param('discountCodeId') discountCodeId: string,
    @Body() updateDiscountDto: Partial<DiscountCodesDto>,
  ) {
    return await this.tenantAdminService.updateDiscountCode(
      discountCodeId,
      updateDiscountDto,
    );
  }

  @Delete('discount-codes/:discountCodeId')
  async deleteDiscountCode(@Param('discountCodeId') discountCodeId: string) {
    return await this.tenantAdminService.deleteDiscountCode(discountCodeId);
  }

  @Post('orders')
  async createOrder(@Body() ordersDto: OrdersDto) {
    return await this.tenantAdminService.createOrder(ordersDto);
  }

  @Get('orders')
  async getOrders(
    @Query('tenantId') tenantId: string,
    @Query('eventId') eventId?: string,
  ) {
    return await this.tenantAdminService.getOrders(tenantId, eventId);
  }

  @Get('orders/:orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    return await this.tenantAdminService.getOrderById(orderId);
  }

  @Put('orders/:orderId')
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: Partial<OrdersDto>,
  ) {
    return await this.tenantAdminService.updateOrder(orderId, updateOrderDto);
  }

  @Delete('orders/:orderId')
  async deleteOrder(@Param('orderId') orderId: string) {
    return await this.tenantAdminService.deleteOrder(orderId);
  }

  @Post('tickets')
  async createTicket(@Body() ticketsDto: TicketsDto) {
    return await this.tenantAdminService.createTicket(ticketsDto);
  }

  @Get('tickets')
  async getTickets(@Query('orderId') orderId?: string) {
    return await this.tenantAdminService.getTickets(orderId);
  }

  @Get('tickets/:ticketId')
  async getTicketById(@Param('ticketId') ticketId: string) {
    return await this.tenantAdminService.getTicketById(ticketId);
  }

  @Get('tickets/email/:email')
  async getTicketsByAttendeeEmail(@Param('email') email: string) {
    return await this.tenantAdminService.getTicketsByAttendeeEmail(email);
  }

  @Put('tickets/:ticketId')
  async updateTicket(
    @Param('ticketId') ticketId: string,
    @Body() updateTicketDto: Partial<TicketsDto>,
  ) {
    return await this.tenantAdminService.updateTicket(
      ticketId,
      updateTicketDto,
    );
  }

  @Delete('tickets/:ticketId')
  async deleteTicket(@Param('ticketId') ticketId: string) {
    return await this.tenantAdminService.deleteTicket(ticketId);
  }

  @Post('tickets/:ticketId/check-in')
  async checkInTicket(@Param('ticketId') ticketId: string) {
    return await this.tenantAdminService.checkInTicket(ticketId);
  }

  @Get('events/:eventId/stats')
  async getEventStats(@Param('eventId') eventId: string) {
    return await this.tenantAdminService.getEventStats(eventId);
  }
}
