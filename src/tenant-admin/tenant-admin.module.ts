import { Module } from '@nestjs/common';
import { TenantAdminController } from './tenant-admin.controller';
import { TenantAdminService } from './tenant-admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Event,
  EventSession,
  TicketType,
  DiscountCode,
  Order,
  Ticket,
} from './tenant-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventSession,
      TicketType,
      DiscountCode,
      Order,
      Ticket,
    ]),
  ],
  controllers: [TenantAdminController],
  providers: [TenantAdminService],
  exports: [TenantAdminService],
})
export class TenantAdminModule {}
