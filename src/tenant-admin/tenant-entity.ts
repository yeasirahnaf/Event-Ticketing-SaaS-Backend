import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EventEntity } from '../events/event.entity';


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

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;
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

  @ManyToOne(() => EventEntity, (event) => event.ticketTypes)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @OneToMany(() => Ticket, (ticket) => ticket.ticketType)
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

  @ManyToOne(() => EventEntity, (event) => event.discountCodes)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;
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

  @Column('varchar', { length: 100, nullable: true, name: 'public_lookup_token' })
  public_lookup_token: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => EventEntity, (event) => event.orders)
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  order_id: string;

  @Column('uuid')
  ticket_type_id: string;

  @Column('bigint')
  unit_price_taka: number;

  @Column('integer')
  quantity: number;

  @Column('bigint')
  subtotal_taka: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => TicketType)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
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

  @ManyToOne(() => Order, (order) => order.tickets)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => TicketType, (ticketType) => ticketType.tickets)
  @JoinColumn({ name: 'ticket_type_id' })
  ticketType: TicketType;
}
