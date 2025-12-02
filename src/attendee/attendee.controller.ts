import { Controller, Get, Post, Put, Body, Query, Patch, Delete, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { AttendeeService } from './attendee.service';
import { AttendeeDto, FeedbackDto, MessageDto } from './attendee.dto';

@Controller('attendee')
export class AttendeeController {
    constructor(private readonly attendeeService: AttendeeService) { }

    @Post('create-account')
    @UsePipes(new ValidationPipe())
    createAccount(@Body() data: AttendeeDto) {
        return this.attendeeService.createAccount(data);
    }

    @Post('login')
    login(@Body('email') email: string, @Body('password') password: string) {
        return this.attendeeService.login(email, password);
    }

    @Get('view-account')
    viewAccount() {
        return this.attendeeService.viewAccount();
    }

    @Put('update-account')
    @UsePipes(new ValidationPipe())
    updateAccount(@Body() data: AttendeeDto) {
        return this.attendeeService.updateAccount(data);
    }

    @Delete('delete-account')
    deleteAccount() {
        return this.attendeeService.deleteAccount();
    }

    @Get('events')
    getAllEvents() {
        return this.attendeeService.getAllEvents();
    }

    @Get('search-events-by-name/:name')
    searchEvents(@Param('name') name: string) {
        return this.attendeeService.searchEventByName(name);
    }

    @Patch('book-event')
    bookEvent(@Query('eventId') eventId: string) {
        return this.attendeeService.bookEvent(eventId);
    }


    @Post('make-payment')
    makePayment(@Body('eventId') eventId: string, @Body('amount') amount: number) {
        return this.attendeeService.makePayment(eventId, amount);
    }

    @Post('provide-feedback')
    provideFeedback(@Body() feedback: FeedbackDto) {
        return this.attendeeService.provideFeedback(feedback);
    }

    @Post('send-message')
    sendMessage(@Body() data: MessageDto) {
        return this.attendeeService.sendMessage(data);
    }
}

