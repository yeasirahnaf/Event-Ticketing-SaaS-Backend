import { IsString, Matches, IsNotEmpty, 
  IsArray, IsDateString, IsUrl, IsEmail,
  IsNumber,
  MinLength
} from 'class-validator';


export class AttendeeDto {
  @IsNotEmpty()
  @IsNumber()
  id: Number;

  @IsNotEmpty()
  @Matches(/^[^\d]*$/, {
    message: 'Name should not contain numbers',
  })
  name: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/[@#$&]/)
  password: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsArray()
  bookedEvents: string[];

  @IsArray()
  feedbacks: FeedbackDto[];

  @IsDateString()
  dateOfBirth: string;

  @IsUrl()
  socialMediaLinks: string[];
}

export class FeedbackDto {
  eventId: string;
  rating: Number; 
  comments: string;
}

export class PaymentDto {
  attendeeId: Number;
  eventId: string;
  amount: Number;
  status: string; 
}

export class MessageDto {
  to: string;
  message: string;
}
