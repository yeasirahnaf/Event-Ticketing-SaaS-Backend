import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  tenantId: string;

  @Column('varchar', { length: 150 })
  name: string;

  @Column('varchar', { length: 150 })
  slug: string;

  @Column('text')
  description: string;

  @Column('varchar', { length: 200 })
  venue: string;

  @Column('varchar', { length: 100 })
  city: string;

  @Column('varchar', { length: 100 })
  country: string;

  @Column('timestamp')
  start_at: Date;

  @Column('timestamp')
  end_at: Date;

  @Column('varchar', { length: 50, default: 'draft' })
  status: 'draft' | 'scheduled' | 'active' | 'cancelled' | 'completed';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => EventSession, session => session.event)
  sessions: EventSession[];

  @OneToMany(() => TicketType, ticketType => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => DiscountCode, discountCode => discountCode.event)
  discountCodes: DiscountCode[];

  @OneToMany(() => Order, order => order.event)
  orders: Order[];
}

@Entity('event_sessions')
export class EventSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  event_id: string;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('text')
  description: string;

  @Column('timestamp')
  start_at: Date;

  @Column('timestamp')
  end_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Event, event => event.sessions)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}

@Entity('ticket_types')
export class TicketType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  event_id: string;

  @Column('varchar', { length: 150 })
  name: string;

  @Column('text')
  description: string;

  @Column('bigint')
  price_taka: number;

  @Column('varchar', { length: 10, default: 'BDT' })
  currency: string;

  @Column('integer')
  quantity_total: number;

  @Column('integer', { default: 0 })
  quantity_sold: number;

  @Column('timestamp')
  sales_start: Date;

  @Column('timestamp')
  sales_end: Date;

  @Column('varchar', { length: 50, default: 'draft' })
  status: 'draft' | 'active' | 'paused' | 'sold_out' | 'closed';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Event, event => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Ticket, ticket => ticket.ticketType)
  tickets: Ticket[];
}

@Entity('discount_codes')
export class DiscountCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  event_id: string;

  @Column('varchar', { length: 50, unique: true })
  code: string;

  @Column('text')
  description: string;

  @Column('integer')
  max_redemptions: number;

  @Column('integer', { default: 0 })
  times_redeemed: number;

  @Column('varchar', { length: 50 })
  discount_type: 'percentage' | 'fixed_amount';

  @Column('bigint')
  discount_value: number;

  @Column('timestamp')
  starts_at: Date;

  @Column('timestamp')
  expires_at: Date;

  @Column('varchar', { length: 50, default: 'active' })
  status: 'active' | 'expired' | 'disabled';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Event, event => event.discountCodes)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenant_id: string;

  @Column('uuid')
  event_id: string;

  @Column('varchar', { length: 255 })
  buyer_email: string;

  @Column('varchar', { length: 150 })
  buyer_name: string;

  @Column('bigint')
  total_taka: number;

  @Column('varchar', { length: 10, default: 'BDT' })
  currency: string;

  @Column('varchar', { length: 50, default: 'pending' })
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

  @Column('varchar', { length: 255, nullable: true })
  payment_intent_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Event, event => event.orders)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Ticket, ticket => ticket.order)
  tickets: Ticket[];
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  ticket_type_id: string;

  @Column('varchar', { length: 150 })
  attendee_name: string;

  @Column('varchar', { length: 255 })
  attendee_email: string;

  @Column('text')
  qr_code_payload: string;

  @Column('text')
  qr_signature: string;

  @Column('varchar', { length: 50, default: 'valid' })
  status: 'valid' | 'scanned' | 'used' | 'cancelled' | 'refunded';

  @Column('timestamp', { nullable: true })
  checked_in_at: Date;

  @Column('varchar', { length: 50, nullable: true })
  seat_label: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Order, order => order.tickets)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => TicketType, ticketType => ticketType.tickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
}
