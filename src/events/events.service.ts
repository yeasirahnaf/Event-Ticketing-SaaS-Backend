
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createEvent(tenantId: string, createEventDto: CreateEventDto) {
    const slug = createEventDto.slug || this.generateSlug(createEventDto.name);
    
    const eventData: Partial<EventEntity> = {
      ...createEventDto,
      slug,
      tenantId,
      startAt: new Date(createEventDto.startAt),
      endAt: createEventDto.endAt ? new Date(createEventDto.endAt) : undefined,
    };

    const event = this.eventRepository.create(eventData);
    return this.eventRepository.save(event);
  }

  async getEventsByTenant(tenantId: string) {
    return this.eventRepository.find({
      where: { tenantId },
      relations: ['theme'],
      order: { startAt: 'ASC' },
    });
  }

  async getPublicEvents(tenantId: string) {
    return this.eventRepository.find({
      where: { tenantId, status: 'published' },
      relations: ['theme'],
      order: { startAt: 'ASC' },
    });
  }

  async getEventById(id: string) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['theme', 'tenant', 'ticketTypes', 'sessions'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async getEventBySlug(tenantSlug: string, eventSlug: string) {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.tenant', 'tenant')
      .leftJoinAndSelect('event.theme', 'theme')
      .leftJoinAndSelect('event.ticketTypes', 'ticketTypes')
      .leftJoinAndSelect('event.sessions', 'sessions')
      .where('tenant.slug = :tenantSlug', { tenantSlug })
      .andWhere('event.slug = :eventSlug', { eventSlug })
      .andWhere('event.isPublished = :isPublished', { isPublished: true })
      .getOne();

    if (!event) {
      throw new NotFoundException(`Event not found or not published`);
    }
    return event;
  }

  async getEventByGlobalSlug(slug: string) {
    const event = await this.eventRepository.findOne({
      where: { slug },
      relations: ['theme', 'tenant', 'ticketTypes', 'sessions'],
    });

    if (!event) {
      throw new NotFoundException(`Event not found`);
    }
    return event;
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto) {
    const event = await this.getEventById(id);
    
    const updateData: Partial<EventEntity> = {};

    // Only update fields that are provided
    if (updateEventDto.name) updateData.name = updateEventDto.name;
    if (updateEventDto.slug) updateData.slug = updateEventDto.slug;
    if (updateEventDto.description) updateData.description = updateEventDto.description;
    if (updateEventDto.fullDescription) updateData.fullDescription = updateEventDto.fullDescription;
    if (updateEventDto.venue) updateData.venue = updateEventDto.venue;
    if (updateEventDto.city) updateData.city = updateEventDto.city;
    if (updateEventDto.country) updateData.country = updateEventDto.country;
    if (updateEventDto.imageUrl) updateData.imageUrl = updateEventDto.imageUrl;
    if (updateEventDto.price !== undefined) updateData.price = updateEventDto.price;
    if (updateEventDto.status) updateData.status = updateEventDto.status;
    if (updateEventDto.capacity) updateData.capacity = updateEventDto.capacity;
    if (updateEventDto.themeId) updateData.themeId = updateEventDto.themeId;
    if (updateEventDto.bannerImages) updateData.bannerImages = updateEventDto.bannerImages;
    if (updateEventDto.gallery) updateData.gallery = updateEventDto.gallery;
    if (updateEventDto.schedule) updateData.schedule = updateEventDto.schedule;
    if (updateEventDto.faq) updateData.faq = updateEventDto.faq;
    if (updateEventDto.themeCustomization) updateData.themeCustomization = updateEventDto.themeCustomization;
    if (updateEventDto.themeContent) updateData.themeContent = updateEventDto.themeContent;

    if (updateEventDto.startAt) {
      updateData.startAt = new Date(updateEventDto.startAt);
    }
    if (updateEventDto.endAt) {
      updateData.endAt = new Date(updateEventDto.endAt);
    }

    await this.eventRepository.update(id, updateData);
    return this.getEventById(id);
  }

  async updateThemeContent(id: string, themeContent: any) {
    await this.eventRepository.update(id, { themeContent });
    return this.getEventById(id);
  }

  async updateSeoSettings(id: string, seoSettings: any) {
    await this.eventRepository.update(id, { seoSettings });
    return this.getEventById(id);
  }

  async publishEvent(id: string, isPublished: boolean) {
    await this.eventRepository.update(id, { isPublished });
    return this.getEventById(id);
  }

  async deleteEvent(id: string) {
    const event = await this.getEventById(id);
    return this.eventRepository.remove(event);
  }

  // Image Upload Methods
  async uploadBannerImages(eventId: string, files: Express.Multer.File[]) {
    const event = await this.getEventById(eventId);
    
    // Save files and get URLs
    const imageUrls = files.map(file => {
      const filename = `${Date.now()}-${file.originalname}`;
      const uploadPath = path.join(process.cwd(), 'uploads', 'banners', filename);
      
      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(uploadPath, file.buffer);
      return `/uploads/banners/${filename}`;
    });

    // Add to existing banner images
    const bannerImages = [...(event.bannerImages || []), ...imageUrls];
    
    await this.eventRepository.update(eventId, { bannerImages });
    return this.getEventById(eventId);
  }

  async uploadGalleryImages(eventId: string, files: Express.Multer.File[]) {
    const event = await this.getEventById(eventId);
    
    const imageUrls = files.map(file => {
      const filename = `${Date.now()}-${file.originalname}`;
      const uploadPath = path.join(process.cwd(), 'uploads', 'gallery', filename);
      
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(uploadPath, file.buffer);
      return `/uploads/gallery/${filename}`;
    });

    const gallery = [...(event.gallery || []), ...imageUrls];
    
    await this.eventRepository.update(eventId, { gallery });
    return this.getEventById(eventId);
  }

  async deleteImage(eventId: string, imageUrl: string) {
    const event = await this.getEventById(eventId);
    
    // Remove from banner images
    const bannerImages = (event.bannerImages || []).filter(url => url !== imageUrl);
    // Remove from gallery
    const gallery = (event.gallery || []).filter(url => url !== imageUrl);
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await this.eventRepository.update(eventId, { bannerImages, gallery });
    return this.getEventById(eventId);
  }
}
