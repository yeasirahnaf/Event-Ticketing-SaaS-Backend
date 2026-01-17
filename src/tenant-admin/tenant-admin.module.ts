import { Module } from '@nestjs/common';
import { TenantAdminController } from './tenant-admin.controller';
import { TenantAdminService } from './tenant-admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import {
  EventSession,
  TicketType,
  DiscountCode,
  Order,
  OrderItem,
  Ticket,
} from './tenant-entity';
import { EventEntity } from '../events/event.entity';
import { UserEntity } from '../admin/user.entity';
import { TenantUserEntity } from '../admin/tenant-user.entity';
import { TenantEntity } from '../admin/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventSession,
      TicketType,
      DiscountCode,
      Order,
      OrderItem,
      Ticket,
      UserEntity,
      TenantUserEntity,
      TenantEntity,
    ]),
    MailerModule,
  ],
  controllers: [TenantAdminController],
  providers: [TenantAdminService],
  exports: [TenantAdminService],
})
export class TenantAdminModule {}
