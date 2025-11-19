import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  IsArray,
  IsInt,
  Min,
  Max,
  Matches,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

//create admin dto
export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s]+$/i, {
    message: 'name must contain only alphabets and spaces',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(/.*@aiub\.edu$/)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsUUID()
  tenantId: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/, {
    message:
      'phone must be a valid Bangladesh number (e.g. +8801XXXXXXXXX or 01XXXXXXXXX)',
  })
  phone: string;

  @IsIn(['owner', 'admin', 'staff', 'superadmin'])
  role: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: string;

  @Matches(/^\d{10,17}$/, {
    message: 'nidNumber must be 10 to 17 digits',
  })
  nidNumber: string;

  @IsOptional()
  @IsUrl()
  nidImageUrl?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

//update admin dto
export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z\s]+$/i, {
    message: 'name must contain only alphabets and spaces',
  })
  name?: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(/.*@aiub\.edu$/)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/, {
    message:
      'phone must be a valid Bangladesh number (e.g. +8801XXXXXXXXX or 01XXXXXXXXX)',
  })
  phone?: string;

  @IsOptional()
  @IsIn(['owner', 'admin', 'staff', 'superadmin'])
  role?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: string;

  @IsOptional()
  @Matches(/^\d{10,17}$/, {
    message: 'nidNumber must be 10 to 17 digits',
  })
  nidNumber?: string;

  @IsOptional()
  @IsUrl()
  nidImageUrl?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

//update admin status dto
export class UpdateAdminStatusDto {
  @IsIn(['active', 'inactive', 'suspended'], {
    message: 'status must be one of: active, inactive, suspended',
  })
  status: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(/.*@aiub\.edu$/)
  email: string;

  @MinLength(8)
  password: string;

  @IsUUID()
  tenantId: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/, {
    message:
      'phone must be a valid Bangladesh number (e.g. +8801XXXXXXXXX or 01XXXXXXXXX)',
  })
  phone: string;

  @IsIn(['owner', 'admin', 'staff'])
  role: string;
}

export class AdminQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: string;

  @IsOptional()
  @IsIn(['owner', 'admin', 'staff', 'superadmin'])
  role?: string;

  @IsOptional()
  @IsUUID()
  tenantId?: string;
}

// Task3 DTOs for User operations
export class CreateTask3UserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  age: number;
}

export class UpdateUserStatusDto {
  @IsIn(['active', 'inactive'], {
    message: 'status must be either active or inactive',
  })
  status: string;
}
