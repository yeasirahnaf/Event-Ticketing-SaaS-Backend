import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';


import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { StaffEntity } from './staff.entity';
import { ActivityLogEntity } from '../admin/activity-log.entity';
import { CreateStaffDto, UpdateStaffDto, CheckinDto  } from './staff.dto';

import {
  Event,
  TicketType,
  Order,
  Ticket,
} from '../tenant-admin/tenant-entity';
import { UserEntity } from '../admin/user.entity';
import { TenantUserEntity } from '../admin/tenant-user.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(StaffEntity)
    private readonly staffRepo: Repository<StaffEntity>,

    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepo: Repository<ActivityLogEntity>,

    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(TicketType)
    private readonly ticketTypeRepo: Repository<TicketType>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(TenantUserEntity)
    private readonly tenantUserRepo: Repository<TenantUserEntity>,
  ) {}

  /**
   * =====================================================
   * STAFF MANAGEMENT METHODS
   * =====================================================
   */

  /**
   * Helper method to sync TenantUserEntity status with StaffEntity.isActive
   * Ensures data consistency between the two entities
   */
  private async syncTenantUserStatus(
    tenantId: string,
    userId: string,
    isActive: boolean,
  ): Promise<void> {
    const status = isActive ? 'active' : 'inactive';
    await this.tenantUserRepo.update(
      { tenantId, userId },
      { status },
    );
  }

  /**
   * Create a new staff member for a tenant.
   * Called from: POST /staff/register
   * 
   * This method:
   * 1. Creates a UserEntity with email and password
   * 2. Creates a StaffEntity linked to that user
   * 3. Creates a TenantUserEntity entry for authentication (role='staff')
   */
  async registerStaff(
    tenantId: string,
    dto: CreateStaffDto,
  ): Promise<StaffEntity> {
    // Step 1: Check if user with this email already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    let userId: string;

    if (existingUser) {
      // User exists, check if they're already staff for this tenant
      const existingStaff = await this.staffRepo.findOne({
        where: { tenantId, userId: existingUser.id },
      });

      if (existingStaff) {
        throw new ConflictException(
          `Staff with email ${dto.email} already exists in this tenant`,
        );
      }

      // User exists but not as staff for this tenant, use existing user
      userId = existingUser.id;
    } else {
      // Step 2: Create new UserEntity
      const passwordHash = await bcrypt.hash(dto.password, 10);

      const newUser = this.userRepo.create({
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName,
        isPlatformAdmin: false,
      });

      const savedUser = await this.userRepo.save(newUser);
      userId = savedUser.id;
    }

    // Step 3: Create StaffEntity linked to the user
    const staff = this.staffRepo.create({
      tenantId,
      userId,
      fullName: dto.fullName,
      position: dto.position,
      phoneNumber: dto.phoneNumber ?? null,
      gender: dto.gender ?? null,
      isActive: true,
    });

    const savedStaff = await this.staffRepo.save(staff);

    // Step 4: Create TenantUserEntity entry for authentication (role='staff')
    // This allows the user to authenticate and get the 'staff' role for this tenant
    const existingTenantUser = await this.tenantUserRepo.findOne({
      where: { tenantId, userId },
    });

    if (!existingTenantUser) {
      const tenantUser = this.tenantUserRepo.create({
        tenantId,
        userId,
        role: 'staff',
        status: 'active',
        invitedAt: new Date(),
      });

      await this.tenantUserRepo.save(tenantUser);
    } else if (existingTenantUser.role !== 'staff') {
      // Update role if it's different
      existingTenantUser.role = 'staff';
      existingTenantUser.status = 'active';
      await this.tenantUserRepo.save(existingTenantUser);
    }

    // TODO: Send welcome/invitation email when MailerService is implemented
    // Mailer functionality will be added later

    return savedStaff;
  }

  /**
   * Get currently logged-in staff profile by staffId.
   * Called from: GET /staff/me
   * 
   * Note: staffId from JWT is actually the userId (sub field in JWT payload)
   */
  async getCurrentStaff(staffId: string): Promise<StaffEntity> {
    // First verify user has active TenantUserEntity with role='staff'
    const tenantUser = await this.tenantUserRepo.findOne({
      where: { userId: staffId, role: 'staff', status: 'active' },
      relations: ['user', 'tenant'],
    });

    if (!tenantUser) {
      throw new NotFoundException(
        `Staff record not found or inactive for user ${staffId}`,
      );
    }

    // Find StaffEntity linked to this user and tenant
    let staff = await this.staffRepo.findOne({
      where: { userId: staffId, tenantId: tenantUser.tenantId },
      relations: ['user', 'tenant'],
    });

    // If StaffEntity doesn't exist but TenantUserEntity does (e.g., created by admin),
    // create a minimal StaffEntity record
    if (!staff && tenantUser) {
      staff = this.staffRepo.create({
        tenantId: tenantUser.tenantId,
        userId: tenantUser.userId,
        fullName: tenantUser.user.fullName,
        position: 'STAFF', // Default position
        isActive: tenantUser.status === 'active',
      });
      staff = await this.staffRepo.save(staff);
    }

    if (!staff) {
      throw new NotFoundException(`Staff record not found for user ${staffId}`);
    }

    return staff;
  }

  /**
   * Update staff profile (name, position, phone, gender, password).
   * Called from: PUT /staff/me
   */
  async updateStaffProfile(
    staffId: string,
    dto: UpdateStaffDto,
  ): Promise<StaffEntity> {
    const staff = await this.staffRepo.findOne({
      where: { id: staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with id ${staffId} not found`);
    }

    // Handle password update - update in UserEntity
    if (dto.password && staff.user) {
      const hashed = await bcrypt.hash(dto.password, 10);
      staff.user.passwordHash = hashed;
      await this.userRepo.save(staff.user);
    }

    // Update staff-specific fields
    if (dto.fullName !== undefined) {
      staff.fullName = dto.fullName;
      // Also update in UserEntity if user exists
      if (staff.user) {
        staff.user.fullName = dto.fullName;
        await this.userRepo.save(staff.user);
      }
    }
    if (dto.position !== undefined) staff.position = dto.position;
    if (dto.phoneNumber !== undefined) staff.phoneNumber = dto.phoneNumber;
    if (dto.gender !== undefined) staff.gender = dto.gender;

    const updated = await this.staffRepo.save(staff);
    return updated;
  }

  /**
   * Update staff email.
   * Called from: PATCH /staff/me/email
   */
  async updateStaffEmail(
    staffId: string,
    newEmail: string,
  ): Promise<StaffEntity> {
    if (!newEmail) {
      throw new BadRequestException('New email must be provided');
    }

    const staff = await this.staffRepo.findOne({
      where: { id: staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with id ${staffId} not found`);
    }

    // Check if email is already used by another user
    const existingUser = await this.userRepo.findOne({
      where: { email: newEmail.toLowerCase().trim() },
    });

    if (existingUser && existingUser.id !== staff.userId) {
      // Check if that user is already staff for this tenant
      const duplicateStaff = await this.staffRepo.findOne({
        where: { tenantId: staff.tenantId, userId: existingUser.id },
      });

      if (duplicateStaff) {
        throw new ConflictException(
          `Email ${newEmail} is already used by another staff member in this tenant`,
        );
      }
    }

    // Update email in UserEntity
    if (staff.user) {
      staff.user.email = newEmail.toLowerCase().trim();
      await this.userRepo.save(staff.user);
    } else {
      throw new NotFoundException(
        `User record not found for staff ${staffId}`,
      );
    }

    return staff;
  }

  /**
   * Soft-delete (deactivate) a staff member.
   * Called from: DELETE /staff/:id
   * 
   * This method:
   * 1. Deactivates StaffEntity (sets isActive = false)
   * 2. Updates TenantUserEntity status to 'inactive' (prevents authentication)
   */
  async deleteStaff(staffId: string): Promise<{ message: string }> {
    const staff = await this.staffRepo.findOne({
      where: { id: staffId },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with id ${staffId} not found`);
    }

    // Step 1: Deactivate StaffEntity
    staff.isActive = false;
    await this.staffRepo.save(staff);

    // Step 2: Sync TenantUserEntity status to 'inactive' to prevent authentication
    // This ensures staff cannot login after deactivation
    await this.syncTenantUserStatus(staff.tenantId, staff.userId, false);

    return { message: 'Staff member deactivated successfully' };
  }

  /**
   * =====================================================
   * TICKET CHECK-IN & LIST
   * =====================================================
   */

  /**
   * Check in a ticket using scanned QR payload or ticket id.
   * Called from: POST /staff/:id/checkin
   */
  async checkInTicket(
    staffId: string,
    dto: CheckinDto,
  ): Promise<{ message: string; ticket: Partial<Ticket> }> {
    if (!dto.qrPayload) {
      throw new BadRequestException('QR payload is required');
    }

    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${staffId} not found`);
    }

    // Find ticket by qr_code_payload or by id
    const ticket = await this.ticketRepo.findOne({
      where: [
        { qr_code_payload: dto.qrPayload },
        { id: dto.qrPayload as any },
      ],
      relations: ['order', 'order.event'],
    });

    if (!ticket) {
      // Log invalid scan
      await this.activityLogRepo.save(
        this.activityLogRepo.create({
          tenantId: staff.tenantId,
          actorId: staff.id,
          action: 'INVALID_QR',
          metadata: { qrPayload: dto.qrPayload },
        }),
      );

      throw new NotFoundException('Ticket not found for given QR payload');
    }

    // Validate ticket belongs to the same tenant as staff
    if (ticket.order?.tenant_id !== staff.tenantId) {
      // Log unauthorized access attempt
      await this.activityLogRepo.save(
        this.activityLogRepo.create({
          tenantId: staff.tenantId,
          actorId: staff.id,
          action: 'UNAUTHORIZED_CHECKIN_ATTEMPT',
          metadata: {
            ticketId: ticket.id,
            ticketTenantId: ticket.order?.tenant_id,
            staffTenantId: staff.tenantId,
          },
        }),
      );

      throw new ForbiddenException(
        'Ticket does not belong to your tenant',
      );
    }

    // Already checked in?
    if (ticket.checked_in_at) {
      await this.activityLogRepo.save(
        this.activityLogRepo.create({
          tenantId: staff.tenantId,
          actorId: staff.id,
          action: 'DUPLICATE_SCAN',
          metadata: {
            ticketId: ticket.id,
            checkedInAt: ticket.checked_in_at,
          },
        }),
      );

      throw new BadRequestException('Ticket has already been checked in');
    }

    // Mark as checked in
    ticket.checked_in_at = new Date();

    const savedTicket = await this.ticketRepo.save(ticket);

    // Log success
    await this.activityLogRepo.save(
      this.activityLogRepo.create({
        tenantId: staff.tenantId,
        actorId: staff.id,
        action: 'CHECKIN_SUCCESS',
        metadata: {
          ticketId: ticket.id,
          attendeeName: ticket.attendee_name,
          attendeeEmail: ticket.attendee_email,
          eventId: ticket.order?.event_id,
        },
      }),
    );

    // TODO: Send check-in confirmation email when MailerService is implemented
    // Mailer functionality will be added later

    // Hide QR payload in response
      const { qr_code_payload, ...safeTicket } = savedTicket as any;

    return {
      message: 'Ticket checked in successfully',
      ticket: safeTicket,
    };
  }

  /**
   * List tickets for a tenant with simple pagination.
   * Called from: GET /staff/tickets
   */
  async getAssignedTickets(
    tenantId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Partial<Ticket>[]; total: number; page: number }> {
    const [tickets, total] = await this.ticketRepo.findAndCount({
      where: { order: { tenant_id: tenantId } },
      relations: ['order', 'order.event', 'ticketType'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const safeTickets = tickets.map((t) => {
      const { qr_code_payload, ...rest } = t as any;
      return rest;
    });

    return {
      data: safeTickets,
      total,
      page,
    };
  }

  /**
   * =====================================================
   * ACTIVITY LOG METHODS (1:N Staff → ActivityLogs)
   * =====================================================
   */

  /**
   * Get logs for a staff member.
   * Called from: GET /staff/:id/logs
   */
  async getStaffActivityLogs(
    staffId: string,
    page: number,
    limit: number,
  ): Promise<{ data: ActivityLogEntity[]; total: number }> {
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${staffId} not found`);
    }

    const [logs, total] = await this.activityLogRepo.findAndCount({
      where: { actorId: staffId, tenantId: staff.tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: logs, total };
  }

  /**
   * Create a log entry for a staff actor.
   * Called from: POST /staff/:id/logs
   */
  async createActivityLog(
    staffId: string,
    action: string,
    description: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLogEntity> {
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException(`Staff with id ${staffId} not found`);
    }

    const log = this.activityLogRepo.create({
      tenantId: staff.tenantId,
      actorId: staffId,
      action,
      metadata: {
        description,
        ...(metadata || {}),
      },
    });

    return this.activityLogRepo.save(log);
  }

  /**
   * Delete a log by its id.
   * Called from: DELETE /staff/:id/logs/:logId
   */
  async deleteActivityLog(logId: string): Promise<{ message: string }> {
    const log = await this.activityLogRepo.findOne({ where: { id: logId } });

    if (!log) {
      throw new NotFoundException(`Activity log with id ${logId} not found`);
    }

    await this.activityLogRepo.remove(log);

    return { message: 'Activity log deleted successfully' };
  }

  /**
   * =====================================================
   * REPORTING & SEARCH
   * =====================================================
   */

  /**
   * Attendance records (all checked-in tickets, optionally filtered by event).
   * Called from: GET /staff/attendance-records
   */
  async getAttendanceRecords(
    tenantId: string,
    eventId?: string,
  ): Promise<Ticket[]> {
    try {
      const qb = this.ticketRepo
        .createQueryBuilder('ticket')
        .innerJoinAndSelect('ticket.order', 'order')
        .innerJoinAndSelect('order.event', 'event')
        .where('order.tenant_id = :tenantId', { tenantId })
        .andWhere('ticket.checked_in_at IS NOT NULL');

      if (eventId) {
        qb.andWhere('event.id = :eventId', { eventId });
      }

      return await qb.orderBy('ticket.checked_in_at', 'DESC').getMany();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to load attendance records',
      );
    }
  }

  /**
   * Search tickets by attendee name or email for a tenant.
   * Called from: GET /staff/search/tickets
   */
  async searchTickets(
    tenantId: string,
    searchTerm: string,
  ): Promise<Partial<Ticket>[]> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new BadRequestException(
        'Search term must be at least 2 characters long',
      );
    }

    const tickets = await this.ticketRepo
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.order', 'order')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(ticket.attendeeName ILIKE :q OR ticket.attendeeEmail ILIKE :q)',
        { q: `%${searchTerm}%` },
      )
      .orderBy('ticket.created_at', 'DESC')
      .getMany();

    return tickets.map((t) => {
      const { qr_code_payload, ...rest } = t as any;
      return rest;
    });
  }

  /**
   * =====================================================
   * EVENT READ-ONLY ACCESS (Per Plan Requirements)
   * =====================================================
   */

  /**
   * List all events for a tenant (read-only).
   * Called from: GET /staff/events
   */
  async getTenantEvents(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Event[]; total: number; page: number }> {
    const [events, total] = await this.eventRepo.findAndCount({
      where: { tenantId },
      relations: ['ticketTypes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { start_at: 'ASC' },
    });

    return { data: events, total, page };
  }

  /**
   * Get event details by ID (read-only).
   * Called from: GET /staff/events/:id
   */
  async getEventById(
    tenantId: string,
    eventId: string,
  ): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id: eventId, tenantId },
      relations: ['ticketTypes', 'sessions'],
    });

    if (!event) {
      throw new NotFoundException(
        `Event with id ${eventId} not found for this tenant`,
      );
    }

    return event;
  }

  /**
   * Get ticket types for an event (read-only).
   * Called from: GET /staff/events/:id/ticket-types
   */
  async getEventTicketTypes(
    tenantId: string,
    eventId: string,
  ): Promise<TicketType[]> {
    // Verify event belongs to tenant
    const event = await this.eventRepo.findOne({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      throw new NotFoundException(
        `Event with id ${eventId} not found for this tenant`,
      );
    }

    const ticketTypes = await this.ticketTypeRepo.find({
      where: { event_id: eventId },
      order: { price_taka: 'ASC' },
    });

    return ticketTypes;
  }

  /**
   * Get remaining capacity for an event.
   * Called from: GET /staff/events/:id/capacity
   */
  async getEventCapacity(
    tenantId: string,
    eventId: string,
  ): Promise<{
    eventId: string;
    eventName: string;
    ticketTypes: Array<{
      id: string;
      name: string;
      total: number;
      sold: number;
      remaining: number;
      percentageSold: number;
    }>;
    totalCapacity: number;
    totalSold: number;
    totalRemaining: number;
  }> {
    // Verify event belongs to tenant
    const event = await this.eventRepo.findOne({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      throw new NotFoundException(
        `Event with id ${eventId} not found for this tenant`,
      );
    }

    const ticketTypes = await this.ticketTypeRepo.find({
      where: { event_id: eventId },
    });

    const capacityData = ticketTypes.map((tt) => ({
      id: tt.id,
      name: tt.name,
      total: tt.quantity_total,
      sold: tt.quantity_sold,
      remaining: tt.quantity_total - tt.quantity_sold,
      percentageSold:
        tt.quantity_total > 0
          ? Math.round((tt.quantity_sold / tt.quantity_total) * 100)
          : 0,
    }));

    const totalCapacity = ticketTypes.reduce(
      (sum, tt) => sum + tt.quantity_total,
      0,
    );
    const totalSold = ticketTypes.reduce(
      (sum, tt) => sum + tt.quantity_sold,
      0,
    );
    const totalRemaining = totalCapacity - totalSold;

    return {
      eventId: event.id,
      eventName: event.name,
      ticketTypes: capacityData,
      totalCapacity,
      totalSold,
      totalRemaining,
    };
  }

  /**
   * =====================================================
   * ORDER LOOKUP (Per Plan Requirements)
   * =====================================================
   */

  /**
   * Search orders by buyer email.
   * Called from: GET /staff/orders/search?email=...
   */
  async searchOrdersByEmail(
    tenantId: string,
    email: string,
  ): Promise<Order[]> {
    if (!email || email.trim().length < 3) {
      throw new BadRequestException('Email must be at least 3 characters long');
    }

    const orders = await this.orderRepo.find({
      where: {
        tenant_id: tenantId,
        buyer_email: email.toLowerCase().trim(),
      },
      relations: ['event', 'tickets'],
      order: { created_at: 'DESC' },
    });

    return orders;
  }

  /**
   * Search order by code (public lookup token or order ID).
   * Called from: GET /staff/orders/search?code=...
   */
  async searchOrderByCode(
    tenantId: string,
    code: string,
  ): Promise<Order | null> {
    if (!code || code.trim().length < 3) {
      throw new BadRequestException('Code must be at least 3 characters long');
    }

    const order = await this.orderRepo.findOne({
      where: [
        { tenant_id: tenantId, id: code },
      ],
      relations: ['event', 'tickets', 'tickets.ticketType'],
    });

    return order;
  }

  /**
   * Get order details by ID.
   * Called from: GET /staff/orders/:id
   */
  async getOrderById(
    tenantId: string,
    orderId: string,
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, tenant_id: tenantId },
      relations: [
        'event',
        'tickets',
        'tickets.ticketType',
      ],
    });

    if (!order) {
      throw new NotFoundException(
        `Order with id ${orderId} not found for this tenant`,
      );
    }

    return order;
  }
}
