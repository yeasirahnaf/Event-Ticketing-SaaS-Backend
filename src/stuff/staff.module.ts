import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffEntity } from './staff.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { ActivityLogEntity } from '../admin/activity-log.entity';
import {
  Event,
  TicketType,
  Order,
  Ticket,
} from '../tenant-admin/tenant-entity';
import { UserEntity } from '../admin/user.entity';
import { TenantUserEntity } from '../admin/tenant-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StaffEntity,
      ActivityLogEntity,
      Ticket,
      Event,
      TicketType,
      Order,
      UserEntity,
      TenantUserEntity,
    ]),
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
