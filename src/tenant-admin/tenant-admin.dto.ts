import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  IsNumber,
  Min,
  IsPositive,
  IsEnum,
  IsEmail,
  MinLength,
  IsIn,
  IsObject,
} from 'class-validator';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class createEventsDto {
  @IsOptional()
  @IsString()
  tenantId?: string; // Will be set from JWT token, not from DTO

  @IsNotEmpty({ message: 'Please enter a valid name' })
  @MaxLength(150, {
    message: 'Name is too long. Maximum length is 150 characters',
  })
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Name should contain only alphabetic characters',
  })
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  venue: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  start_at: Date;

  @IsNotEmpty()
  end_at: Date;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
  
  
  created_at?: Date;

  
  updated_at?: Date;
}

export class EventSessionsDto {
  @IsNotEmpty()
  @IsString()
  event_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200, {
    message: 'Title is too long. Maximum length is 200 characters',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  start_at: Date;

  @IsNotEmpty()
  end_at: Date;
}

export enum TicketTypeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  SOLD_OUT = 'sold_out',
  CLOSED = 'closed',
}

export class CreateTicketsDto {
  @IsNotEmpty()
  @IsString()
  event_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150, {
    message: 'Name is too long. Maximum length is 150 characters',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'price_taka must be a positive number' })
  price_taka: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'quantity_total must be a positive number' })
  quantity_total: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'quantity_sold must be 0 or greater' })
  quantity_sold: number;

  @IsNotEmpty()
  sales_start: Date;

  @IsNotEmpty()
  sales_end: Date;

  @IsOptional()
  @IsEnum(TicketTypeStatus)
  status?: TicketTypeStatus;
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum DiscountStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

export class DiscountCodesDto {
  @IsNotEmpty()
  @IsString()
  event_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50, {
    message: 'Code is too long. Maximum length is 50 characters',
  })
  code: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'max_redemptions must be a positive number' })
  max_redemptions: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'times_redeemed must be 0 or greater' })
  times_redeemed: number;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'discount_value must be a positive number' })
  discount_value: number;

  @IsNotEmpty()
  starts_at: Date;

  @IsNotEmpty()
  expires_at: Date;

  @IsOptional()
  @IsEnum(DiscountStatus)
  status?: DiscountStatus;
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export class OrdersDto {
  @IsNotEmpty()
  @IsString()
  tenant_id: string;

  @IsNotEmpty()
  @IsString()
  event_id: string;

  @IsNotEmpty()
  @IsString()
  buyer_email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150, {
    message: 'Buyer name is too long. Maximum length is 150 characters',
  })
  buyer_name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'total_taka must be a positive number' })
  total_taka: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  payment_intent_id?: string;

  @IsOptional()
  created_at?: Date;

  @IsOptional()
  updated_at?: Date;
}

export enum TicketStatus {
  VALID = 'valid',
  SCANNED = 'scanned',
  USED = 'used',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export class TicketsDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  ticket_type_id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150, {
    message: 'Attendee name is too long. Maximum length is 150 characters',
  })
  attendee_name: string;

  @IsNotEmpty()
  @IsString()
  attendee_email: string;

  @IsNotEmpty()
  @IsString()
  qr_code_payload: string;

  @IsNotEmpty()
  @IsString()
  qr_signature: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  checked_in_at?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'Seat label is too long. Maximum length is 50 characters',
  })
  seat_label?: string;
}

// Tenant User Management DTOs (for TenantAdmin)
export class InviteStaffDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;
}

export class UpdateStaffStatusDto {
  @IsIn(['active', 'inactive', 'suspended'], {
    message: 'status must be one of: active, inactive, suspended',
  })
  status: string;
}

// Tenant Branding DTO
export class UpdateTenantBrandingDto {
  @IsOptional()
  @IsObject()
  brandingSettings?: Record<string, any>;
}
