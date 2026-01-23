import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { TenantAdminModule } from './tenant-admin/tenant-admin.module';
import { StaffModule } from './staff/staff.module';
import { AttendeeModule } from './attendee/attendee.module';
import { PublicController } from './app/public.controller';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        ignoreTLS: true,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: `"Event Ticketing System" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
      },
    }),
    TenantAdminModule,
    AdminModule,
    AuthModule,
    StaffModule,
    AttendeeModule,
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          }
        : {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: '1212',
            database: 'Saas',
            autoLoadEntities: true,
            synchronize: true,
          },
    ),
    EventsModule,
    TicketsModule,
    SharedModule,
  ],
  controllers: [PublicController],
  providers: [],
})
export class AppModule { }
