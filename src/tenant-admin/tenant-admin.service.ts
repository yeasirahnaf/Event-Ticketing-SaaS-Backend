import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { EventEntity } from '../events/event.entity';
import {
  EventSession,
  TicketType,
  DiscountCode,
  Order,
  OrderItem,
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
  InviteStaffDto,
  UpdateStaffDto,
  UpdateStaffStatusDto,
  UpdateTenantBrandingDto,
} from './tenant-admin.dto';
import { UserEntity } from '../admin/user.entity';
import { TenantUserEntity } from '../admin/tenant-user.entity';
import { TenantEntity } from '../admin/tenant.entity';

@Injectable()
export class TenantAdminService {
  constructor(
    @InjectRepository(EventEntity) private eventRepository: Repository<EventEntity>,
    @InjectRepository(EventSession)
    private eventSessionRepository: Repository<EventSession>,
    @InjectRepository(TicketType)
    private ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(DiscountCode)
    private discountCodeRepository: Repository<DiscountCode>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TenantUserEntity)
    private tenantUserRepository: Repository<TenantUserEntity>,
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    private readonly mailerService: MailerService,
  ) {}

  async createEvent(createEventsDto: any): Promise<EventEntity> {
    try {
      // Map DTO (snake_case) to Entity (camelCase)
      const eventData = {
        name: createEventsDto.name,
        slug: createEventsDto.slug,
        description: createEventsDto.description,
        venue: createEventsDto.venue,
        city: createEventsDto.city,
        country: createEventsDto.country,
        startAt: createEventsDto.start_at,
        endAt: createEventsDto.end_at,
        tenantId: createEventsDto.tenant_id || createEventsDto.tenantId,
        status: createEventsDto.status || 'draft',
        isPublished: false, // Default
        // Note: imageUrl is not in DTO
      };

      const event = this.eventRepository.create(eventData);
      const savedEvent = await this.eventRepository.save(event);
      return Array.isArray(savedEvent) ? savedEvent[0] : savedEvent;
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Event with same unique field already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create event');
    }
  }

  async getAllEvents(tenantId: string): Promise<EventEntity[]> {
    return await this.eventRepository.find({
      where: { tenantId: tenantId },
      relations: ['sessions', 'ticketTypes', 'discountCodes', 'orders'],
    });
  }

  async getEventById(tenantId: string, eventId: string): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, tenantId: tenantId },
      relations: ['sessions', 'ticketTypes', 'discountCodes', 'orders'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return event;
  }

  async updateEvent(
    tenantId: string,
    eventId: string,
    updateEventsDto: Partial<createEventsDto>,
  ): Promise<EventEntity> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, eventId);
    
    // Map updates
    const updateData: any = {};
    if (updateEventsDto.name) updateData.name = updateEventsDto.name;
    if (updateEventsDto.slug) updateData.slug = updateEventsDto.slug;
    if (updateEventsDto.description) updateData.description = updateEventsDto.description;
    if (updateEventsDto.venue) updateData.venue = updateEventsDto.venue;
    if (updateEventsDto.city) updateData.city = updateEventsDto.city;
    if (updateEventsDto.country) updateData.country = updateEventsDto.country;
    if (updateEventsDto.start_at) updateData.startAt = updateEventsDto.start_at;
    if (updateEventsDto.end_at) updateData.endAt = updateEventsDto.end_at;
    if (updateEventsDto.status) updateData.status = updateEventsDto.status;
    
    await this.eventRepository.update(eventId, updateData);
    return await this.getEventById(tenantId, eventId);
  }

  async deleteEvent(
    tenantId: string,
    eventId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, eventId);
    
    const result = await this.eventRepository.delete(eventId);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    return { success: true, message: 'Event deleted successfully' };
  }

  async createEventSession(
    tenantId: string,
    eventSessionDto: EventSessionsDto,
  ): Promise<EventSession> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, eventSessionDto.event_id);
    
    try {
      // Map event_id manually since renaming/mapping happened
      const sessionData = {
          ...eventSessionDto,
          event: { id: eventSessionDto.event_id } as any 
      };
      
      const session = this.eventSessionRepository.create(sessionData);
      return await this.eventSessionRepository.save(session);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Event session with same unique field already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create event session');
    }
  }

  async getEventSessions(tenantId: string, eventId: string): Promise<EventSession[]> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, eventId);
    
    return await this.eventSessionRepository.find({
      where: { event: { id: eventId } },
      relations: ['event'],
    });
  }

  async getEventSessionById(tenantId: string, sessionId: string): Promise<EventSession> {
    const session = await this.eventSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['event'],
    });
    if (!session) {
      throw new NotFoundException(
        `Event session with ID ${sessionId} not found`,
      );
    }
    // Verify event belongs to tenant
    if (session.event.tenantId !== tenantId) {
      throw new NotFoundException(
        `Event session with ID ${sessionId} not found`,
      );
    }
    return session;
  }

  async updateEventSession(
    tenantId: string,
    sessionId: string,
    updateSessionDto: Partial<EventSessionsDto>,
  ): Promise<EventSession> {
    // Verify session belongs to tenant
    await this.getEventSessionById(tenantId, sessionId);
    
    // If event_id is being updated, verify new event belongs to tenant
    if (updateSessionDto.event_id) {
      await this.getEventById(tenantId, updateSessionDto.event_id);
    }
    
    await this.eventSessionRepository.update(sessionId, updateSessionDto);
    return await this.getEventSessionById(tenantId, sessionId);
  }

  async deleteEventSession(
    tenantId: string,
    sessionId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify session belongs to tenant
    await this.getEventSessionById(tenantId, sessionId);
    
    const result = await this.eventSessionRepository.delete(sessionId);
    if (result.affected === 0) {
      throw new NotFoundException(`Event session with ID ${sessionId} not found`);
    }
    return { success: true, message: 'Event session deleted successfully' };
  }

  async createTicketType(
    tenantId: string,
    createTicketDto: CreateTicketsDto,
  ): Promise<TicketType> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, createTicketDto.event_id);
    
    try {
       // Manual link to event by ID
       const ticketTypeData = {
           ...createTicketDto,
           event: { id: createTicketDto.event_id } as any
       };
       
      const ticketType = this.ticketTypeRepository.create(ticketTypeData);
      return await this.ticketTypeRepository.save(ticketType);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ticket type with same unique field already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create ticket type');
    }
  }

  async getTicketTypes(tenantId: string, eventId: string): Promise<TicketType[]> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, eventId);
    
    return await this.ticketTypeRepository.find({
      where: { event: { id: eventId } },
      relations: ['event', 'tickets'],
    });
  }

  async getTicketTypeById(tenantId: string, ticketTypeId: string): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id: ticketTypeId },
      relations: ['event', 'tickets'],
    });
    if (!ticketType) {
      throw new NotFoundException(
        `Ticket type with ID ${ticketTypeId} not found`,
      );
    }
    // Verify event belongs to tenant
    if (ticketType.event.tenantId !== tenantId) {
      throw new NotFoundException(
        `Ticket type with ID ${ticketTypeId} not found`,
      );
    }
    return ticketType;
  }

  async updateTicketType(
    tenantId: string,
    ticketTypeId: string,
    updateTicketDto: Partial<CreateTicketsDto>,
  ): Promise<TicketType> {
    // Verify ticket type belongs to tenant
    await this.getTicketTypeById(tenantId, ticketTypeId);
    
    // If event_id is being updated, verify new event belongs to tenant
    if (updateTicketDto.event_id) {
      await this.getEventById(tenantId, updateTicketDto.event_id);
    }
    
    await this.ticketTypeRepository.update(ticketTypeId, updateTicketDto);
    return await this.getTicketTypeById(tenantId, ticketTypeId);
  }

  async deleteTicketType(
    tenantId: string,
    ticketTypeId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify ticket type belongs to tenant
    await this.getTicketTypeById(tenantId, ticketTypeId);
    
    const result = await this.ticketTypeRepository.delete(ticketTypeId);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket type with ID ${ticketTypeId} not found`);
    }
    return { success: true, message: 'Ticket type deleted successfully' };
  }

  async createDiscountCode(
    tenantId: string,
    discountCodeDto: DiscountCodesDto,
  ): Promise<DiscountCode> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, discountCodeDto.event_id);
    
    try {
      const discountData = {
          ...discountCodeDto,
          event: { id: discountCodeDto.event_id } as any
      };
      
      const discountCode = this.discountCodeRepository.create(discountData);
      return await this.discountCodeRepository.save(discountCode);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Discount code already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create discount code');
    }
  }

  async getDiscountCodes(tenantId: string, eventId: string): Promise<DiscountCode[]> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, eventId);
    
    return await this.discountCodeRepository.find({
      where: { event: { id: eventId } },
      relations: ['event'],
    });
  }

  async getDiscountCodeById(tenantId: string, discountCodeId: string): Promise<DiscountCode> {
    const discountCode = await this.discountCodeRepository.findOne({
      where: { id: discountCodeId },
      relations: ['event'],
    });
    if (!discountCode) {
      throw new NotFoundException(
        `Discount code with ID ${discountCodeId} not found`,
      );
    }
    // Verify event belongs to tenant
    if (discountCode.event.tenantId !== tenantId) {
      throw new NotFoundException(
        `Discount code with ID ${discountCodeId} not found`,
      );
    }
    return discountCode;
  }

  async getDiscountCodeByCode(tenantId: string, code: string): Promise<DiscountCode> {
    const discountCode = await this.discountCodeRepository.findOne({
      where: { code },
      relations: ['event'],
    });
    if (!discountCode) {
      throw new NotFoundException(`Discount code ${code} not found`);
    }
    // Verify event belongs to tenant
    if (discountCode.event.tenantId !== tenantId) {
      throw new NotFoundException(`Discount code ${code} not found`);
    }
    return discountCode;
  }

  async updateDiscountCode(
    tenantId: string,
    discountCodeId: string,
    updateDiscountDto: Partial<DiscountCodesDto>,
  ): Promise<DiscountCode> {
    // Verify discount code belongs to tenant
    await this.getDiscountCodeById(tenantId, discountCodeId);
    
    // If event_id is being updated, verify new event belongs to tenant
    if (updateDiscountDto.event_id) {
      await this.getEventById(tenantId, updateDiscountDto.event_id);
    }
    
    await this.discountCodeRepository.update(discountCodeId, updateDiscountDto);
    return await this.getDiscountCodeById(tenantId, discountCodeId);
  }

  async deleteDiscountCode(
    tenantId: string,
    discountCodeId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify discount code belongs to tenant
    await this.getDiscountCodeById(tenantId, discountCodeId);
    
    const result = await this.discountCodeRepository.delete(discountCodeId);
    if (result.affected === 0) {
      throw new NotFoundException(`Discount code with ID ${discountCodeId} not found`);
    }
    return { success: true, message: 'Discount code deleted successfully' };
  }

  async createOrder(tenantId: string, ordersDto: OrdersDto): Promise<Order> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, ordersDto.event_id);
    
    try {
      const orderData = { 
          ...ordersDto, 
          tenant_id: tenantId,
          event: { id: ordersDto.event_id } as any
      };
      
      const order = this.orderRepository.create(orderData);
      return await this.orderRepository.save(order);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Order with same identifier already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create order');
    }
  }

  async getOrders(tenantId: string, eventId?: string): Promise<Order[]> {
    const query = this.orderRepository.createQueryBuilder('order')
      .where('order.tenant_id = :tenantId', { tenantId });

    if (eventId) {
      query.andWhere('order.event_id = :eventId', { eventId });
    }

    return await query
      .leftJoinAndSelect('order.event', 'event')
      .leftJoinAndSelect('order.tickets', 'tickets')
      .getMany();
  }

  async getOrderById(tenantId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, tenant_id: tenantId },
      relations: ['event', 'tickets'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return order;
  }

  async updateOrder(
    tenantId: string,
    orderId: string,
    updateOrderDto: Partial<OrdersDto>,
  ): Promise<Order> {
    // Verify order belongs to tenant
    await this.getOrderById(tenantId, orderId);
    
    // If event_id is being updated, verify new event belongs to tenant
    if (updateOrderDto.event_id) {
      await this.getEventById(tenantId, updateOrderDto.event_id);
    }
    
    // Ensure tenant_id cannot be changed
    const updateData: any = { ...updateOrderDto };
    delete updateData.tenant_id;
    
    await this.orderRepository.update(orderId, updateData);
    return await this.getOrderById(tenantId, orderId);
  }

  async deleteOrder(
    tenantId: string,
    orderId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify order belongs to tenant
    await this.getOrderById(tenantId, orderId);
    
    const result = await this.orderRepository.delete(orderId);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return { success: true, message: 'Order deleted successfully' };
  }

  async createTicket(tenantId: string, ticketsDto: TicketsDto): Promise<Ticket> {
    // Verify order belongs to tenant
    await this.getOrderById(tenantId, ticketsDto.order_id);
    
    try {
      const ticket = this.ticketRepository.create(ticketsDto);
      return await this.ticketRepository.save(ticket);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('Ticket with same identifier already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create ticket');
    }
  }

  async getTickets(tenantId: string, orderId?: string): Promise<Ticket[]> {
    const query = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .where('order.tenant_id = :tenantId', { tenantId });

    if (orderId) {
      query.andWhere('ticket.order_id = :orderId', { orderId });
    }

    return await query.getMany();
  }

  async getTicketById(tenantId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
      relations: ['order', 'ticketType'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
    // Verify order belongs to tenant
    if (ticket.order.tenant_id !== tenantId) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
    return ticket;
  }

  async getTicketsByAttendeeEmail(tenantId: string, email: string): Promise<Ticket[]> {
    return await this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.order', 'order')
      .leftJoinAndSelect('ticket.ticketType', 'ticketType')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('ticket.attendee_email = :email', { email })
      .getMany();
  }

  async updateTicket(
    tenantId: string,
    ticketId: string,
    updateTicketDto: Partial<TicketsDto>,
  ): Promise<Ticket> {
    // Verify ticket belongs to tenant
    await this.getTicketById(tenantId, ticketId);
    
    // If order_id is being updated, verify new order belongs to tenant
    if (updateTicketDto.order_id) {
      await this.getOrderById(tenantId, updateTicketDto.order_id);
    }
    
    await this.ticketRepository.update(ticketId, updateTicketDto);
    return await this.getTicketById(tenantId, ticketId);
  }

  async deleteTicket(
    tenantId: string,
    ticketId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify ticket belongs to tenant
    await this.getTicketById(tenantId, ticketId);
    
    const result = await this.ticketRepository.delete(ticketId);
    if (result.affected === 0) {
      throw new NotFoundException(`Ticket with ID ${ticketId} not found`);
    }
    return { success: true, message: 'Ticket deleted successfully' };
  }

  async checkInTicket(tenantId: string, ticketId: string): Promise<Ticket> {
    return await this.updateTicket(tenantId, ticketId, {
      status: TicketStatus.SCANNED,
      checked_in_at: new Date(),
    });
  }

  async getEventStats(tenantId: string, eventId: string): Promise<{
    totalTicketsAvailable: number;
    totalTicketsSold: number;
    totalRevenue: number;
    ordersCount: number;
  }> {
    // Verify event belongs to tenant
    await this.getEventById(tenantId, eventId);
    
    const ticketTypes = await this.ticketTypeRepository.find({
      where: { event: { id: eventId } },
      relations: ['event'],
    });
    const orders = await this.orderRepository.find({
      where: { event: { id: eventId }, tenant_id: tenantId },
      relations: ['event'],
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

  // Tenant User Management (Staff Management)
  async inviteStaff(
    tenantId: string,
    inviteStaffDto: InviteStaffDto,
  ): Promise<TenantUserEntity> {
    // Check if user with email already exists
    let user = await this.userRepository.findOne({
      where: { email: inviteStaffDto.email },
    });

    // Create user if doesn't exist
    if (!user) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(inviteStaffDto.password, salt);

      user = this.userRepository.create({
        email: inviteStaffDto.email,
        passwordHash: hashedPassword,
        fullName: inviteStaffDto.fullName,
        isPlatformAdmin: false,
      });
      user = await this.userRepository.save(user);
    }

    // Check if tenant user relationship already exists
    const existingTenantUser = await this.tenantUserRepository.findOne({
      where: {
        tenantId,
        userId: user.id,
      },
    });

    if (existingTenantUser) {
      throw new ConflictException(
        'User is already a member of this tenant',
      );
    }

    // Create tenant user relationship with 'staff' role
    const tenantUser = this.tenantUserRepository.create({
      tenantId,
      userId: user.id,
      role: 'staff',
      status: inviteStaffDto.status ?? 'active',
      invitedAt: new Date(),
    });

    const savedTenantUser = await this.tenantUserRepository.save(tenantUser);

    // Send invitation email
    try {
      await this.mailerService.sendMail({
        to: inviteStaffDto.email,
        subject: 'Staff Invitation - Event Ticketing System',
        text: `Hello ${inviteStaffDto.fullName},\n\nYou have been invited to join as a staff member for the Event Ticketing System.\n\nYour login credentials:\nEmail: ${inviteStaffDto.email}\nPassword: ${inviteStaffDto.password}\n\nPlease login and change your password for security.\n\nBest regards,\nEvent Ticketing Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Staff Invitation</h2>
            <p>Hello ${inviteStaffDto.fullName},</p>
            <p>You have been invited to join as a staff member for the Event Ticketing System.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Your login credentials:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Email: ${inviteStaffDto.email}</li>
                <li>Password: ${inviteStaffDto.password}</li>
              </ul>
            </div>
            <p><strong>Important:</strong> Please login and change your password for security.</p>
            <p>Best regards,<br>Event Ticketing Team</p>
          </div>
        `,
      });
    } catch (error) {
      // Log error but don't fail the invitation
      console.error('Failed to send invitation email:', error);
    }

    return savedTenantUser;
  }

  async getAllStaff(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: TenantUserEntity[]; total: number; page: number }> {
    const [data, total] = await this.tenantUserRepository.findAndCount({
      where: {
        tenantId,
        role: 'staff',
      },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page };
  }

  async getStaffById(
    tenantId: string,
    staffId: string,
  ): Promise<TenantUserEntity> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: {
        id: staffId,
        tenantId,
        role: 'staff',
      },
      relations: ['user'],
    });

    if (!tenantUser) {
      throw new NotFoundException(
        `Staff member with id ${staffId} not found in your tenant`,
      );
    }

    return tenantUser;
  }

  async updateStaff(
    tenantId: string,
    staffId: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<TenantUserEntity> {
    // Verify staff belongs to tenant
    const tenantUser = await this.getStaffById(tenantId, staffId);

    await this.tenantUserRepository.update(staffId, updateStaffDto);

    return await this.getStaffById(tenantId, staffId);
  }

  async updateStaffStatus(
    tenantId: string,
    staffId: string,
    updateStatusDto: UpdateStaffStatusDto,
  ): Promise<TenantUserEntity> {
    // Verify staff belongs to tenant
    await this.getStaffById(tenantId, staffId);

    await this.tenantUserRepository.update(staffId, {
      status: updateStatusDto.status,
    });

    return await this.getStaffById(tenantId, staffId);
  }

  async removeStaff(tenantId: string, staffId: string): Promise<void> {
    // Verify staff belongs to tenant
    await this.getStaffById(tenantId, staffId);

    const result = await this.tenantUserRepository.delete(staffId);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Staff member with id ${staffId} not found`,
      );
    }
  }

  // Tenant Branding Management
  async updateTenantBranding(
    tenantId: string,
    updateBrandingDto: UpdateTenantBrandingDto,
  ): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }

    await this.tenantRepository.update(tenantId, {
      brandingSettings: updateBrandingDto.brandingSettings,
    });

    const updatedTenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!updatedTenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }

    return updatedTenant;
  }

  async getTenantBranding(tenantId: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${tenantId} not found`);
    }

    return tenant;
  }
}
