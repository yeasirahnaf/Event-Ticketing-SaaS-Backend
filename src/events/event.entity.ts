
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TenantEntity } from '../admin/tenant.entity';
import { ThemeEntity } from '../admin/theme.entity';

@Entity('events_v2')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tenantId: string;

  @ManyToOne(() => TenantEntity)
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  startAt: Date;

  @Column({ nullable: true })
  endAt: Date;

  @Column()
  venue: string;

  @Column()
  city: string;

  @Column({ default: 'Bangladesh' })
  country: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: 'Price in BDT (Taka)' })
  price: number;

  @Column({ default: 'draft' }) // draft, published, cancelled
  status: string;

  @Column({ default: false })
  isPublished: boolean; // Controls public visibility on landing page

  @Column({ type: 'int', default: 100 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  soldCount: number;

  // Theme Integration
  @Column({ nullable: true })
  themeId: string;

  @ManyToOne(() => ThemeEntity, { nullable: true })
  @JoinColumn({ name: 'themeId' })
  theme: ThemeEntity;

  // Single-Event Landing Page Fields
  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  bannerImages: string[]; // Array of banner image URLs

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  gallery: string[]; // Gallery image URLs

  @Column({ type: 'text', nullable: true })
  fullDescription: string; // Rich text description

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  schedule: { time: string; activity: string; description?: string }[];

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  faq: { question: string; answer: string }[];

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  themeCustomization: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    customCss?: string;
  };

  // Enhanced Theme Content for Complete Landing Page
  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  themeContent: {
    hero?: {
      title: string;
      subtitle: string;
      backgroundImage: string;
      ctaText: string;
      ctaLink: string;
    };
    about?: {
      heading: string;
      content: string;
      images: string[];
    };
    features?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    schedule?: Array<{
      time: string;
      title: string;
      description: string;
      speaker?: string;
    }>;
    tickets?: Array<{
      name: string;
      price: number; // BDT
      description: string;
      available: number;
      features: string[];
    }>;
    speakers?: Array<{
      name: string;
      role: string;
      bio: string;
      photo: string;
      social?: { twitter?: string; linkedin?: string };
    }>;
    venue?: {
      name: string;
      address: string;
      mapUrl: string;
      directions: string;
      parking: string;
    };
    gallery?: string[];
    faq?: Array<{ question: string; answer: string }>;
  };

  // SEO Settings
  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  seoSettings: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  
  @OneToMany('TicketType', 'event')
  ticketTypes: any[];

  @OneToMany('DiscountCode', 'event')
  discountCodes: any[];

  @OneToMany('Order', 'event')
  orders: any[];

  @OneToMany('EventSession', 'event')
  sessions: any[];
}
