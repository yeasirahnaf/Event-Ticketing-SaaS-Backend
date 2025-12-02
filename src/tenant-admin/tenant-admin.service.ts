import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Event,
  EventSession,
  TicketType,
  DiscountCode,
  Order,
  Ticket,
} from './tenant-entity';
import {
  createEventsDto,
  EventSessionsDto,
  CreateTicketsDto,
  DiscountCodesDto,
  OrdersDto,
  TicketsDto,
  EventStatus,
  TicketTypeStatus,
  DiscountStatus,
  OrderStatus,
  TicketStatus,
} from './tenant-admin.dto';

@Injectable()
export class TenantAdminService {
  constructor(
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    @InjectRepository(EventSession)
    private eventSessionRepository: Repository<EventSession>,
    @InjectRepository(TicketType)
    private ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(DiscountCode)
    private discountCodeRepository: Repository<DiscountCode>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
  ) {}

  async createEvent(createEventsDto: createEventsDto): Promise<Event> {
    const event = this.eventRepository.create(createEventsDto);
    return await this.eventRepository.save(event);
  }

  async getAllEvents(tenantId: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { tenantId },
      relations: ['sessions', 'ticketTypes', 'discountCodes', 'orders'],
    });
  }

  async getEventById(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['sessions', 'ticketTypes', 'discountCodes', 'orders'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return event;
  }

  async updateEvent(
    eventId: string,
    updateEventsDto: Partial<createEventsDto>,
  ): Promise<Event> {
    await this.eventRepository.update(eventId, updateEventsDto);
    return await this.getEventById(eventId);
  }

  async deleteEvent(
    eventId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.eventRepository.delete(eventId);
    if (result.affected === 0) {
      return { success: false, message: 'Event not found' };
    }
    return { success: true, message: 'Event deleted successfully' };
  }

  async createEventSession(
    eventSessionDto: EventSessionsDto,
  ): Promise<EventSession> {
    const session = this.eventSessionRepository.create(eventSessionDto);
    return await this.eventSessionRepository.save(session);
  }

  async getEventSessions(eventId: string): Promise<EventSession[]> {
    return await this.eventSessionRepository.find({
      where: { event_id: eventId },
      relations: ['event'],
    });
  }

  async getEventSessionById(sessionId: string): Promise<EventSession> {
    const session = await this.eventSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['event'],
    });
    if (!session) {
      throw new NotFoundException(
        `Event session with ID ${sessionId} not found`,
      );
    }
    return session;
  }

  async updateEventSession(
    sessionId: string,
    updateSessionDto: Partial<EventSessionsDto>,
  ): Promise<EventSession> {
    await this.eventSessionRepository.update(sessionId, updateSessionDto);
    return await this.getEventSessionById(sessionId);
  }

  async deleteEventSession(
    sessionId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.eventSessionRepository.delete(sessionId);
    if (result.affected === 0) {
      return { success: false, message: 'Event session not found' };
    }
    return { success: true, message: 'Event session deleted successfully' };
  }

  async createTicketType(
    createTicketDto: CreateTicketsDto,
  ): Promise<TicketType> {
    const ticketType = this.ticketTypeRepository.create(createTicketDto);
    return await this.ticketTypeRepository.save(ticketType);
  }

  async getTicketTypes(eventId: string): Promise<TicketType[]> {
    return await this.ticketTypeRepository.find({
      where: { event_id: eventId },
      relations: ['event', 'tickets'],
    });
  }

  async getTicketTypeById(ticketTypeId: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id: ticketTypeId },
      relations: ['event', 'tickets'],
    });
    if (!ticketType) {
      throw new NotFoundException(
        `Ticket type with ID ${ticketTypeId} not found`,
      );
    }
    return ticketType;
  }

  async updateTicketType(
    ticketTypeId: string,
    updateTicketDto: Partial<CreateTicketsDto>,
  ): Promise<TicketType> {
    await this.ticketTypeRepository.update(ticketTypeId, updateTicketDto);
    return await this.getTicketTypeById(ticketTypeId);
  }

  async deleteTicketType(
    ticketTypeId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.ticketTypeRepository.delete(ticketTypeId);
    if (result.affected === 0) {
      return { success: false, message: 'Ticket type not found' };
    }
    return { success: true, message: 'Ticket type deleted successfully' };
  }

  async createDiscountCode(
    discountCodeDto: DiscountCodesDto,
  ): Promise<DiscountCode> {
    const discountCode = this.discountCodeRepository.create(discountCodeDto);
    return await this.discountCodeRepository.save(discountCode);
  }

  async getDiscountCodes(eventId: string): Promise<DiscountCode[]> {
    return await this.discountCodeRepository.find({
      where: { event_id: eventId },
      relations: ['event'],
    });
  }

  async getDiscountCodeById(discountCodeId: string): Promise<DiscountCode> {
    const discountCode = await this.discountCodeRepository.findOne({
      where: { id: discountCodeId },
      relations: ['event'],
    });
    if (!discountCode) {
      throw new NotFoundException(
        `Discount code with ID ${discountCodeId} not found`,
      );
    }
    return discountCode;
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode> {
    const discountCode = await this.discountCodeRepository.findOne({
      where: { code },
      relations: ['event'],
    });
    if (!discountCode) {
      throw new NotFoundException(`Discount code ${code} not found`);
    }
    return discountCode;
  }

  async updateDiscountCode(
    discountCodeId: string,
    updateDiscountDto: Partial<DiscountCodesDto>,
  ): Promise<DiscountCode> {
    await this.discountCodeRepository.update(discountCodeId, updateDiscountDto);
    return await this.getDiscountCodeById(discountCodeId);
  }

  async deleteDiscountCode(
    discountCodeId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.discountCodeRepository.delete(discountCodeId);
    if (result.affected === 0) {
      return { success: false, message: 'Discount code not found' };
    }
    return { success: true, message: 'Discount code deleted successfully' };
  }

  async createOrder(ordersDto: OrdersDto): Promise<Order> {
    const order = this.orderRepository.create(ordersDto);
    return await this.orderRepository.save(order);
  }

  async getOrders(tenantId: string, eventId?: string): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .where('order.tenant_id = :tenantId', { tenantId });

    if (eventId) {
      query.andWhere('order.event_id = :eventId', { eventId });
    }

    return await query
      .leftJoinAndSelect('order.event', 'event')
      .leftJoinAndSelect('order.tickets', 'tickets')
      .getMany();
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['event', 'tickets'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  async updateOrder(
    orderId: string,
    updateOrderDto: Partial<OrdersDto>,
  ): Promise<Order> {
    await this.orderRepository.update(orderId, updateOrderDto);
    return await this.getOrderById(orderId);
  }

  async deleteOrder(
    orderId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.orderRepository.delete(orderId);
    if (result.affected === 0) {
      return { success: false, message: 'Order not found' };
    }
    return { success: true, message: 'Order deleted successfully' };
  }

  async createTicket(ticketsDto: TicketsDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(ticketsDto);
    return await this.ticketRepository.save(ticket);
  }

  async getTickets(orderId?: string): Promise<Ticket[]> {
    const query = this.ticketRepository.createQueryBuilder('ticket');

    if (orderId) {
      query.where('ticket.order_id = :orderId', { orderId });
    }

    return await query
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .getMany();
  }

  async getTicketById(ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['order', 'ticketType'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
    return ticket;
  }

  async getTicketsByAttendeeEmail(email: string): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      where: { attendee_email: email },
      relations: ['order', 'ticketType'],
    });
  }

  async updateTicket(
    ticketId: string,
    updateTicketDto: Partial<TicketsDto>,
  ): Promise<Ticket> {
    await this.ticketRepository.update(ticketId, updateTicketDto);
    return await this.getTicketById(ticketId);
  }

  async deleteTicket(
    ticketId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.ticketRepository.delete(ticketId);
    if (result.affected === 0) {
      return { success: false, message: 'Ticket not found' };
    }
    return { success: true, message: 'Ticket deleted successfully' };
  }

  async checkInTicket(ticketId: string): Promise<Ticket> {
    return await this.updateTicket(ticketId, {
      status: TicketStatus.SCANNED,
      checked_in_at: new Date(),
    });
  }

  async getEventStats(eventId: string): Promise<{
    totalTicketsAvailable: number;
    totalTicketsSold: number;
    totalRevenue: number;
    ordersCount: number;
  }> {
    const ticketTypes = await this.ticketTypeRepository.find({
      where: { event_id: eventId },
    });
    const orders = await this.orderRepository.find({
      where: { event_id: eventId },
    });

    const totalTicketsAvailable = ticketTypes.reduce(
      (sum, tt) => sum + tt.quantity_total,
      0,
    );
    const totalTicketsSold = ticketTypes.reduce(
      (sum, tt) => sum + tt.quantity_sold,
      0,
    );
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total_taka || 0),
      0,
    );

    return {
      totalTicketsAvailable,
      totalTicketsSold,
      totalRevenue,
      ordersCount: orders.length,
    };
  }
}
