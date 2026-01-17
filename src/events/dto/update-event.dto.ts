import { IsString, IsOptional, IsDateString, IsArray, IsObject, IsNumber, Min } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fullDescription?: string;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  // Theme Integration
  @IsString()
  @IsOptional()
  themeId?: string;

  @IsArray()
  @IsOptional()
  bannerImages?: string[];

  @IsArray()
  @IsOptional()
  gallery?: string[];

  @IsArray()
  @IsOptional()
  schedule?: { time: string; activity: string; description?: string }[];

  @IsArray()
  @IsOptional()
  faq?: { question: string; answer: string }[];

  @IsObject()
  @IsOptional()
  themeCustomization?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    customCss?: string;
  };

  @IsObject()
  @IsOptional()
  themeContent?: any;
}
