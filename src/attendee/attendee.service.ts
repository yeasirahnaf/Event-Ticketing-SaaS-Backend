import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  TicketType,
  DiscountCode,
  Order,
  OrderItem,
  Ticket,
  EventSession,
} from '../tenant-admin/tenant-entity';
import { EventEntity } from '../events/event.entity';
import {
  CheckoutDto,
  OrderResponseDto,
  OrderItemResponseDto,
  TicketResponseDto,
  PublicEventResponseDto,
  PublicTicketTypeResponseDto,
  PublicEventSessionResponseDto,
  ValidateDiscountCodeDto,
  DiscountCodeValidationResponseDto,
  OrderLookupDto,
} from './attendee.dto';
import * as crypto from 'crypto';

@Injectable()
export class AttendeeService {
  private readonly QR_SECRET = process.env.QR_SECRET || 'default-secret-key-change-in-production';

  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(EventSession)
    private eventSessionRepository: Repository<EventSession>,
    @InjectRepository(TicketType)
    private ticketTypeRepository: Repository<TicketType>,
    @InjectRepository(DiscountCode)
    private discountCodeRepository: Repository<DiscountCode>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get all public events (status = 'active' and is_public = true)
   */
  async getAllPublicEvents(): Promise<PublicEventResponseDto[]> {
    const events = await this.eventRepository.find({
      where: { status: 'active', isPublished: true },
      relations: ['ticketTypes', 'sessions'],
      order: { startAt: 'ASC' },
    });

    return events.map((event) => this.mapToPublicEventResponse(event));
  }

  /**
   * Get event by slug (public access)
   */
  async getEventBySlug(slug: string): Promise<PublicEventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { slug, status: 'active', isPublished: true },
      relations: ['ticketTypes', 'sessions'],
    });

    if (!event) {
      throw new NotFoundException(`Event with slug '${slug}' not found`);
    }

    return this.mapToPublicEventResponse(event);
  }

  /**
   * Get event by ID (public access)
   */
  async getEventById(eventId: string): Promise<PublicEventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, status: 'active', isPublished: true },
      relations: ['ticketTypes', 'sessions'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID '${eventId}' not found`);
    }

    return this.mapToPublicEventResponse(event);
  }

  /**
   * Get ticket types for an event (public access)
   */
  async getTicketTypesForEvent(eventId: string): Promise<PublicTicketTypeResponseDto[]> {
    const ticketTypes = await this.ticketTypeRepository.find({
      where: { event_id: eventId, status: 'active' },
      order: { price_taka: 'ASC' },
    });

    const now = new Date();
    return ticketTypes
      .filter((tt) => {
        // Filter by sales period
        return new Date(tt.sales_start) <= now && new Date(tt.sales_end) >= now;
      })
      .map((tt) => ({
        id: tt.id,
        name: tt.name,
        description: tt.description,
        price_taka: tt.price_taka,
        currency: tt.currency,
        quantity_total: tt.quantity_total,
        quantity_sold: tt.quantity_sold,
        quantity_available: tt.quantity_total - tt.quantity_sold,
        sales_start: tt.sales_start,
        sales_end: tt.sales_end,
        status: tt.status,
      }));
  }

  /**
   * Validate discount code for an event
   */
  async validateDiscountCode(
    dto: ValidateDiscountCodeDto,
  ): Promise<DiscountCodeValidationResponseDto> {
    const discountCode = await this.discountCodeRepository.findOne({
      where: {
        event_id: dto.event_id,
        code: dto.code.toUpperCase(),
        status: 'active',
      },
    });

    if (!discountCode) {
      return {
        valid: false,
        message: 'Discount code not found or invalid',
      };
    }

    const now = new Date();
    if (new Date(discountCode.starts_at) > now) {
      return {
        valid: false,
        message: 'Discount code has not started yet',
      };
    }

    if (new Date(discountCode.expires_at) < now) {
      return {
        valid: false,
        message: 'Discount code has expired',
      };
    }

    if (discountCode.times_redeemed >= discountCode.max_redemptions) {
      return {
        valid: false,
        message: 'Discount code has reached maximum redemptions',
      };
    }

    return {
      valid: true,
      code: discountCode.code,
      discount_type: discountCode.discount_type,
      discount_value: discountCode.discount_value,
      message: 'Discount code is valid',
    };
  }

  /**
   * Create order and tickets (checkout flow)
   */
  async checkout(checkoutDto: CheckoutDto): Promise<OrderResponseDto> {
    // 1. Validate event exists and is active and public
    const event = await this.eventRepository.findOne({
      where: { id: checkoutDto.event_id, status: 'active', isPublished: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID '${checkoutDto.event_id}' not found or not available for purchase`);
    }

    // 2. Validate ticket types and inventory
    const ticketTypeIds = checkoutDto.items.map((item) => item.ticket_type_id);
    const ticketTypes = await this.ticketTypeRepository.find({
      where: ticketTypeIds.map((id) => ({ id, event_id: checkoutDto.event_id })),
    });

    if (ticketTypes.length !== ticketTypeIds.length) {
      throw new BadRequestException('One or more ticket types not found for this event');
    }

    // 3. Check inventory and calculate totals
    let totalTaka = 0;
    const orderItemsData: Array<{
      ticketType: TicketType;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    for (const item of checkoutDto.items) {
      const ticketType = ticketTypes.find((tt) => tt.id === item.ticket_type_id);
      if (!ticketType) {
        throw new BadRequestException(`Ticket type ${item.ticket_type_id} not found`);
      }

      if (ticketType.status !== 'active') {
        throw new BadRequestException(`Ticket type ${ticketType.name} is not available for purchase`);
      }

      const now = new Date();
      if (new Date(ticketType.sales_start) > now || new Date(ticketType.sales_end) < now) {
        throw new BadRequestException(`Ticket type ${ticketType.name} is not available for purchase at this time`);
      }

      const available = ticketType.quantity_total - ticketType.quantity_sold;
      if (item.quantity > available) {
        throw new BadRequestException(
          `Insufficient inventory for ${ticketType.name}. Available: ${available}, Requested: ${item.quantity}`,
        );
      }

      const subtotal = ticketType.price_taka * item.quantity;
      totalTaka += subtotal;

      orderItemsData.push({
        ticketType,
        quantity: item.quantity,
        unitPrice: ticketType.price_taka,
        subtotal,
      });
    }

    // 4. Apply discount code if provided
    let discountAmount = 0;
    if (checkoutDto.discount_code) {
      const discountValidation = await this.validateDiscountCode({
        event_id: checkoutDto.event_id,
        code: checkoutDto.discount_code,
      });

      if (discountValidation.valid && discountValidation.discount_type && discountValidation.discount_value) {
        if (discountValidation.discount_type === 'percentage') {
          discountAmount = Math.floor((totalTaka * discountValidation.discount_value) / 100);
        } else {
          discountAmount = discountValidation.discount_value;
        }
        totalTaka = Math.max(0, totalTaka - discountAmount);

        // Increment redemption count
        await this.discountCodeRepository.increment(
          { code: checkoutDto.discount_code.toUpperCase(), event_id: checkoutDto.event_id },
          'times_redeemed',
          1,
        );
      }
    }

    // 5. Create order and order items in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create order
      const order = queryRunner.manager.create(Order, {
        tenant_id: event.tenantId,
        event_id: checkoutDto.event_id,
        buyer_email: checkoutDto.buyer_email,
        buyer_name: checkoutDto.buyer_name,
        total_taka: totalTaka,
        currency: 'BDT',
        status: 'pending',
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items
      const orderItems = orderItemsData.map((itemData) =>
        queryRunner.manager.create(OrderItem, {
          order_id: savedOrder.id,
          ticket_type_id: itemData.ticketType.id,
          unit_price_taka: itemData.unitPrice,
          quantity: itemData.quantity,
          subtotal_taka: itemData.subtotal,
        }),
      );

      await queryRunner.manager.save(OrderItem, orderItems);

      // Update inventory
      for (const itemData of orderItemsData) {
        await queryRunner.manager.increment(
          TicketType,
          { id: itemData.ticketType.id },
          'quantity_sold',
          itemData.quantity,
        );
      }

      // Create tickets with QR codes
      const tickets: Ticket[] = [];
      for (const itemData of orderItemsData) {
        for (let i = 0; i < itemData.quantity; i++) {
          const ticket = queryRunner.manager.create(Ticket, {
            order_id: savedOrder.id,
            ticket_type_id: itemData.ticketType.id,
            attendee_name: checkoutDto.buyer_name,
            attendee_email: checkoutDto.buyer_email,
            qr_code_payload: '', // Will be set after ticket is saved
            qr_signature: '', // Will be set after ticket is saved
            status: 'valid',
          });

          tickets.push(ticket);
        }
      }

      const savedTickets = await queryRunner.manager.save(Ticket, tickets);

      // Generate QR codes for each ticket (now we have ticket IDs)
      for (const ticket of savedTickets) {
        const qrPayload = this.generateQRPayload(
          ticket.id,
          savedOrder.id,
          checkoutDto.event_id,
          checkoutDto.buyer_name,
        );
        const qrSignature = this.signQRPayload(qrPayload);

        ticket.qr_code_payload = qrPayload;
        ticket.qr_signature = qrSignature;
      }

      await queryRunner.manager.save(Ticket, savedTickets);

      await queryRunner.commitTransaction();

      // 6. Return order with relations
      const fullOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['orderItems', 'orderItems.ticketType', 'tickets', 'tickets.ticketType', 'event'],
      });

      return this.mapToOrderResponse(fullOrder!);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get orders by email (order history)
   */
  async getOrdersByEmail(email: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.find({
      where: { buyer_email: email },
      relations: ['orderItems', 'orderItems.ticketType', 'tickets', 'tickets.ticketType', 'event'],
      order: { created_at: 'DESC' },
    });

    return orders.map((order) => this.mapToOrderResponse(order));
  }

  /**
   * Get order by ID and email (verify ownership)
   */
  async getOrderById(orderId: string, email: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, buyer_email: email },
      relations: ['orderItems', 'orderItems.ticketType', 'tickets', 'tickets.ticketType', 'event'],
    });

    if (!order) {
      throw new NotFoundException(`Order not found or you don't have access to it`);
    }

    return this.mapToOrderResponse(order);
  }

  /**
   * Get tickets for an order (by email verification)
   */
  async getTicketsForOrder(orderId: string, email: string): Promise<TicketResponseDto[]> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, buyer_email: email },
    });

    if (!order) {
      throw new NotFoundException(`Order not found or you don't have access to it`);
    }

    const tickets = await this.ticketRepository.find({
      where: { order_id: orderId },
      relations: ['ticketType'],
      order: { created_at: 'ASC' },
    });

    return tickets.map((ticket) => ({
      id: ticket.id,
      order_id: ticket.order_id,
      ticket_type_id: ticket.ticket_type_id,
      ticket_type_name: ticket.ticketType.name,
      attendee_name: ticket.attendee_name,
      attendee_email: ticket.attendee_email,
      qr_code_payload: ticket.qr_code_payload,
      status: ticket.status,
      checked_in_at: ticket.checked_in_at,
      seat_label: ticket.seat_label,
    }));
  }

  /**
   * Generate QR code payload
   */
  private generateQRPayload(
    ticketId: string,
    orderId: string,
    eventId: string,
    attendeeName: string,
  ): string {
    const payload = {
      ticketId,
      orderId,
      eventId,
      attendeeName,
      timestamp: Date.now(),
    };
    return JSON.stringify(payload);
  }

  /**
   * Sign QR payload with HMAC
   */
  private signQRPayload(payload: string): string {
    return crypto.createHmac('sha256', this.QR_SECRET).update(payload).digest('hex');
  }

  /**
   * Map Event to PublicEventResponseDto
   */
  private mapToPublicEventResponse(event: EventEntity): PublicEventResponseDto {
    return {
      id: event.id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      venue: event.venue,
      city: event.city,
      country: event.country,
      start_at: event.startAt,
      end_at: event.endAt,
      status: event.status,
      hero_image_url: event.imageUrl || null,
      ticket_types: event.ticketTypes
        ? event.ticketTypes
            .filter((tt) => tt.status === 'active')
            .map((tt) => ({
              id: tt.id,
              name: tt.name,
              description: tt.description,
              price_taka: tt.price_taka,
              currency: tt.currency,
              quantity_total: tt.quantity_total,
              quantity_sold: tt.quantity_sold,
              quantity_available: tt.quantity_total - tt.quantity_sold,
              sales_start: tt.sales_start,
              sales_end: tt.sales_end,
              status: tt.status,
            }))
        : [],
      sessions: event.sessions
        ? event.sessions.map((session: any) => ({
            id: session.id,
            title: session.title,
            description: session.description,
            start_at: session.start_at,
            end_at: session.end_at,
          }))
        : [],
    };
  }

  /**
   * Map Order to OrderResponseDto
   */
  private mapToOrderResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      event_id: order.event_id,
      event_name: order.event?.name || '',
      buyer_email: order.buyer_email,
      buyer_name: order.buyer_name,
      total_taka: order.total_taka,
      currency: order.currency,
      status: order.status,
      payment_intent_id: order.payment_intent_id || undefined,
      created_at: order.created_at,
      items: order.orderItems
        ? order.orderItems.map((item) => ({
            id: item.id,
            ticket_type_id: item.ticket_type_id,
            ticket_type_name: item.ticketType?.name || '',
            unit_price_taka: item.unit_price_taka,
            quantity: item.quantity,
            subtotal_taka: item.subtotal_taka,
          }))
        : [],
      tickets: order.tickets
        ? order.tickets.map((ticket) => ({
            id: ticket.id,
            order_id: ticket.order_id,
            ticket_type_id: ticket.ticket_type_id,
            ticket_type_name: ticket.ticketType?.name || '',
            attendee_name: ticket.attendee_name,
            attendee_email: ticket.attendee_email,
            qr_code_payload: ticket.qr_code_payload,
            status: ticket.status,
            checked_in_at: ticket.checked_in_at,
            seat_label: ticket.seat_label,
          }))
        : [],
    };
  }
}
