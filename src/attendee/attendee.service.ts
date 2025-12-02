import { Injectable } from '@nestjs/common';
import { AttendeeDto, FeedbackDto, MessageDto, PaymentDto } from './attendee.dto';

@Injectable()
export class AttendeeService {
    private attendee: AttendeeDto | null = {
        id: 1,
        name: "Shahab",
        password: "password@123",
        email: "shahab@gmail.com",
        phone: "01797428386",
        bookedEvents: ["e1"],
        feedbacks: [{ eventId: "e1", rating: 5, comments: "Great event!" }],
        dateOfBirth: "2001-01-01",
        socialMediaLinks: ["https://twitter.com/shahab"]
    };

    private events = [
        { eventId: 'e1', eventName: 'Music Concert' },
        { eventId: 'e2', eventName: 'Art Exhibition' },
    ];

    private payments: PaymentDto[] = [];
    

    createAccount(data: AttendeeDto): { message: string; attendee: AttendeeDto } {
        this.attendee = data;
        return { message: 'Account created successfully', attendee: this.attendee };
    }


    login(email: string, password: string): { message: string} {
        if (this.attendee && this.attendee.email === email && this.attendee.password === password) {
            return { message: 'Login successful'};
        }
        return { message: 'Invalid email or password' };
    }


    viewAccount() {
    return this.attendee ? this.attendee : { message: 'No attendee account found' };
    }

    updateAccount(data: AttendeeDto) {
    if (this.attendee) {
        this.attendee = data;
        return { message: 'Account updated successfully', attendee: this.attendee };
    } else {
        return { message: 'No attendee account found' };
    }
    }


    deleteAccount(): { message: string } {
        if (!this.attendee) return { message: 'No attendee account found to delete' };
        this.attendee = null;
        return { message: 'Attendee account deleted successfully' };
    }


    getAllEvents() {
        return this.events;
    }


    searchEventByName(name: string) {
        return this.events;
    }


    bookEvent(eId: string) {
        if (!this.attendee) return { message: 'No attendee logged in' };
        const event = this.events.find(e => e.eventId === eId);
        if (!event) return { message: 'Event not found' };

        if (!this.attendee.bookedEvents) this.attendee.bookedEvents = [];
        if (this.attendee.bookedEvents.includes(eId)) {
            return { message: 'Event already booked' };
        }

        this.attendee.bookedEvents.push(eId);
        return { message: `Event '${event.eventName}' booked successfully`, attendee: this.attendee };
    }


    makePayment(eventId: string, amount: number) {
        if (!this.attendee) return { message: 'No attendee logged in' };
        const event = this.events.find(e => e.eventId === eventId);
        if (!event) return { message: 'Event not found' };

        this.payments.push({ attendeeId: this.attendee.id, eventId, amount, status: 'paid' });
        return { message: `Payment of ${amount} completed for '${event.eventName}'` };
    }


    provideFeedback(feedback: FeedbackDto) {
        if (!this.attendee) return { message: 'No attendee logged in' };
        if (!this.attendee.feedbacks) this.attendee.feedbacks = [];
        this.attendee.feedbacks.push(feedback);
        return { message: 'Feedback submitted', feedback };
    }

    sendMessage(data: MessageDto) {
        return { message: `Message sent to ${data.to}`, content: data.message };
    }
}