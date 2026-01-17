import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';
import {
  Ticket,
  Order,
  TicketType,
  EventSession,
  OrderItem,
  DiscountCode,
} from '../tenant-admin/tenant-entity';
import { EventEntity } from '../events/event.entity';
import { UserEntity } from '../admin/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      Ticket,
      Order,
      TicketType,
      EventSession,
      UserEntity,
      OrderItem,
      DiscountCode,
    ]),
  ],
  controllers: [AttendeeController],
  providers: [AttendeeService],
  exports: [AttendeeService],
})
export class AttendeeModule {}
