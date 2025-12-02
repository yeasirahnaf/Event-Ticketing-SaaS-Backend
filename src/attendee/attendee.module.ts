import { Module } from '@nestjs/common';
import { AttendeeController } from './attendee.controller';
import { AttendeeService } from './attendee.service';

@Module({
  controllers: [AttendeeController],
  providers: [AttendeeService]
})
export class AttendeeModule {}
