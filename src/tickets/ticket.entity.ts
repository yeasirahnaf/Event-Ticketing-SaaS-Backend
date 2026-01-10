import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventEntity } from '../events/event.entity';

@Entity('tickets_v2')
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => EventEntity)
  @JoinColumn({ name: 'eventId' })
  event: EventEntity;

  @Column()
  name: string; // "VIP", "General Admission", "Early Bird", etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number; // Total available

  @Column({ type: 'int', default: 0 })
  soldCount: number; // Number sold

  @Column({ default: 'available' }) // available, sold_out, hidden
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional ticket info (benefits, restrictions, etc.)

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
