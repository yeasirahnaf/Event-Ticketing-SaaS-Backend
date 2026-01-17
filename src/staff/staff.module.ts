import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffEntity } from './staff.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { StaffService } from './staff.service';
import {
  EventSession,
  Ticket,
  TicketType,
  Order,
} from '../tenant-admin/tenant-entity';
import { EventEntity } from '../events/event.entity';
import { UserEntity } from '../admin/user.entity';
import { TenantUserEntity } from '../admin/tenant-user.entity';
import { ActivityLogEntity } from '../admin/activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StaffEntity,
      EventEntity,
      EventSession,
      Ticket,
      TicketType,
      Order,
      UserEntity,
      TenantUserEntity,
      ActivityLogEntity,
    ]),
    MailerModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
