import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateTenantDto,
  UpdateTenantDto,
  UpdateTenantStatusDto,
  CreateTenantUserDto,
  UpdateTenantUserDto,
  UpdateTenantUserStatusDto,
  CreateWebhookEventDto,
  UpdateWebhookEventDto,
  UpdateWebhookEventStatusDto,
  CreatePaymentDto,
  UpdatePaymentDto,
  UpdatePaymentStatusDto,
  CreateActivityLogDto,
  UserQueryDto,
  TenantQueryDto,
  TenantUserQueryDto,
  WebhookEventQueryDto,
  PaymentQueryDto,
  ActivityLogQueryDto,
} from './admin.dto';
import { UserEntity } from './user.entity';
import { TenantEntity } from './tenant.entity';
import { TenantUserEntity } from './tenant-user.entity';
import { WebhookEventEntity } from './webhook-event.entity';
import { PaymentEntity } from './payment.entity';
import { ActivityLogEntity } from './activity-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private tenantRepository: Repository<TenantEntity>,
    @InjectRepository(TenantUserEntity)
    private tenantUserRepository: Repository<TenantUserEntity>,
    @InjectRepository(WebhookEventEntity)
    private webhookEventRepository: Repository<WebhookEventEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(ActivityLogEntity)
    private activityLogRepository: Repository<ActivityLogEntity>,
  ) {}

  // User operations (Platform Users)
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      fullName: createUserDto.fullName,
      isPlatformAdmin: createUserDto.isPlatformAdmin ?? false,
    });
    return this.userRepository.save(user);
  }

  async registerAdmin(createAdminDto: any): Promise<UserEntity> {
      // Check if email already exists
      const existingUser = await this.findUserByEmail(createAdminDto.email);
      if (existingUser) {
          throw new UnauthorizedException('Email already in use');
      }

      // Create Admin User
      return this.createUser({
          email: createAdminDto.email,
          password: createAdminDto.password,
          fullName: createAdminDto.fullName,
          isPlatformAdmin: true,
      });
  }

  async getAllUsers(query: UserQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<UserEntity> = {};

    if (search) {
      where.email = Like(`%${search}%`);
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Users retrieved successfully',
      meta: {
        page,
        limit,
        total,
        filters: {
          search: search ?? null,
        },
      },
      data,
    };
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findActiveTenantUsersByUserId(
    userId: string,
  ): Promise<TenantUserEntity[]> {
    return this.tenantUserRepository.find({
      where: {
        userId,
        status: 'active',
      },
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const updateData: Partial<UserEntity> = {};
    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }
    if (updateUserDto.password !== undefined) {
      // Generate salt and hash new password
      const salt = await bcrypt.genSalt();
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }
    if (updateUserDto.fullName !== undefined) {
      updateData.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.isPlatformAdmin !== undefined) {
      updateData.isPlatformAdmin = updateUserDto.isPlatformAdmin;
    }
    await this.userRepository.update(id, updateData);
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  // Tenant operations
  async createTenant(createTenantDto: CreateTenantDto): Promise<TenantEntity> {
    const tenant = this.tenantRepository.create({
      name: createTenantDto.name,
      slug: createTenantDto.slug,
      brandingSettings: createTenantDto.brandingSettings,
      status: createTenantDto.status ?? 'pending',
    });
    return this.tenantRepository.save(tenant);
  }

  async getAllTenants(query: TenantQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<TenantEntity> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.tenantRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Tenants retrieved successfully',
      meta: {
        page,
        limit,
        total,
        filters: {
          search: search ?? null,
          status: status ?? null,
        },
      },
      data,
    };
  }

  async getTenantById(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async updateTenant(
    id: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<TenantEntity> {
    await this.tenantRepository.update(id, updateTenantDto);
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async updateTenantStatus(
    id: string,
    updateStatusDto: UpdateTenantStatusDto,
  ): Promise<TenantEntity> {
    await this.tenantRepository.update(id, { status: updateStatusDto.status });
    const tenant = await this.tenantRepository.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
    return tenant;
  }

  async deleteTenant(id: string): Promise<void> {
    const result = await this.tenantRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with id ${id} not found`);
    }
  }

  // Tenant User operations
  async createTenantUser(
    createTenantUserDto: CreateTenantUserDto,
  ): Promise<TenantUserEntity> {
    const tenantUser = this.tenantUserRepository.create({
      tenantId: createTenantUserDto.tenantId,
      userId: createTenantUserDto.userId,
      role: createTenantUserDto.role,
      status: createTenantUserDto.status ?? 'active',
      invitedAt: new Date(),
    });
    return this.tenantUserRepository.save(tenantUser);
  }

  async getAllTenantUsers(query: TenantUserQueryDto) {
    const { page = 1, limit = 10, tenantId, userId, role, status } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<TenantUserEntity> = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (userId) {
      where.userId = userId;
    }
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.tenantUserRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['tenant', 'user'],
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Tenant users retrieved successfully',
      meta: {
        page,
        limit,
        total,
        filters: {
          tenantId: tenantId ?? null,
          userId: userId ?? null,
          role: role ?? null,
          status: status ?? null,
        },
      },
      data,
    };
  }

  async getTenantUserById(id: string): Promise<TenantUserEntity> {
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { id },
      relations: ['tenant', 'user'],
    });
    if (!tenantUser) {
      throw new NotFoundException(`Tenant user with id ${id} not found`);
    }
    return tenantUser;
  }

  async updateTenantUser(
    id: string,
    updateTenantUserDto: UpdateTenantUserDto,
  ): Promise<TenantUserEntity> {
    await this.tenantUserRepository.update(id, updateTenantUserDto);
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { id },
      relations: ['tenant', 'user'],
    });
    if (!tenantUser) {
      throw new NotFoundException(`Tenant user with id ${id} not found`);
    }
    return tenantUser;
  }

  async updateTenantUserStatus(
    id: string,
    updateStatusDto: UpdateTenantUserStatusDto,
  ): Promise<TenantUserEntity> {
    await this.tenantUserRepository.update(id, {
      status: updateStatusDto.status,
    });
    const tenantUser = await this.tenantUserRepository.findOne({
      where: { id },
      relations: ['tenant', 'user'],
    });
    if (!tenantUser) {
      throw new NotFoundException(`Tenant user with id ${id} not found`);
    }
    return tenantUser;
  }

  async deleteTenantUser(id: string): Promise<void> {
    const result = await this.tenantUserRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant user with id ${id} not found`);
    }
  }

  // Webhook Event operations
  async createWebhookEvent(
    createWebhookEventDto: CreateWebhookEventDto,
  ): Promise<WebhookEventEntity> {
    const webhookEvent = this.webhookEventRepository.create({
      provider: createWebhookEventDto.provider,
      eventType: createWebhookEventDto.eventType,
      payload: createWebhookEventDto.payload,
      receivedAt: new Date(createWebhookEventDto.receivedAt),
      status: 'pending',
    });
    return this.webhookEventRepository.save(webhookEvent);
  }

  async getAllWebhookEvents(query: WebhookEventQueryDto) {
    const { page = 1, limit = 10, provider, eventType, status } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<WebhookEventEntity> = {};

    if (provider) {
      where.provider = provider;
    }
    if (eventType) {
      where.eventType = Like(`%${eventType}%`);
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.webhookEventRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { receivedAt: 'DESC' },
    });

    return {
      message: 'Webhook events retrieved successfully',
      meta: {
        page,
        limit,
        total,
        filters: {
          provider: provider ?? null,
          eventType: eventType ?? null,
          status: status ?? null,
        },
      },
      data,
    };
  }

  async getWebhookEventById(id: string): Promise<WebhookEventEntity> {
    const webhookEvent = await this.webhookEventRepository.findOneBy({ id });
    if (!webhookEvent) {
      throw new NotFoundException(`Webhook event with id ${id} not found`);
    }
    return webhookEvent;
  }

  async updateWebhookEvent(
    id: string,
    updateWebhookEventDto: UpdateWebhookEventDto,
  ): Promise<WebhookEventEntity> {
    const updateData: Partial<WebhookEventEntity> = {};
    if (updateWebhookEventDto.processedAt) {
      updateData.processedAt = new Date(updateWebhookEventDto.processedAt);
    }
    if (updateWebhookEventDto.status) {
      updateData.status = updateWebhookEventDto.status;
    }
    if (updateWebhookEventDto.errorMessage !== undefined) {
      updateData.errorMessage = updateWebhookEventDto.errorMessage;
    }

    await this.webhookEventRepository.update(id, updateData);
    const webhookEvent = await this.webhookEventRepository.findOneBy({ id });
    if (!webhookEvent) {
      throw new NotFoundException(`Webhook event with id ${id} not found`);
    }
    return webhookEvent;
  }

  async updateWebhookEventStatus(
    id: string,
    updateStatusDto: UpdateWebhookEventStatusDto,
  ): Promise<WebhookEventEntity> {
    const updateData: Partial<WebhookEventEntity> = {
      status: updateStatusDto.status,
      processedAt: new Date(),
    };
    if (updateStatusDto.errorMessage) {
      updateData.errorMessage = updateStatusDto.errorMessage;
    }

    await this.webhookEventRepository.update(id, updateData);
    const webhookEvent = await this.webhookEventRepository.findOneBy({ id });
    if (!webhookEvent) {
      throw new NotFoundException(`Webhook event with id ${id} not found`);
    }
    return webhookEvent;
  }

  async deleteWebhookEvent(id: string): Promise<void> {
    const result = await this.webhookEventRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Webhook event with id ${id} not found`);
    }
  }

  // Payment operations
  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentEntity> {
    const paymentData: Partial<PaymentEntity> = {
      orderId: createPaymentDto.orderId,
      provider: createPaymentDto.provider,
      providerReference: createPaymentDto.providerReference,
      status: createPaymentDto.status ?? 'pending',
      amountCents: createPaymentDto.amountCents,
      currency: createPaymentDto.currency ?? 'BDT', // Default to BDT (Bangladeshi Taka)
      payload: createPaymentDto.payload,
    };
    if (createPaymentDto.processedAt) {
      paymentData.processedAt = new Date(createPaymentDto.processedAt);
    }
    const payment = this.paymentRepository.create(paymentData);
    return this.paymentRepository.save(payment);
  }

  async getAllPayments(query: PaymentQueryDto) {
    const { page = 1, limit = 10, orderId, provider, status } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<PaymentEntity> = {};

    if (orderId) {
      where.orderId = orderId;
    }
    if (provider) {
      where.provider = provider;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Payments retrieved successfully',
      meta: {
        page,
        limit,
        total,
        filters: {
          orderId: orderId ?? null,
          provider: provider ?? null,
          status: status ?? null,
        },
      },
      data,
    };
  }

  async getPaymentById(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async updatePayment(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentEntity> {
    const updateData: Partial<PaymentEntity> = {};
    if (updatePaymentDto.status) {
      updateData.status = updatePaymentDto.status;
    }
    if (updatePaymentDto.processedAt) {
      updateData.processedAt = new Date(updatePaymentDto.processedAt);
    }
    if (updatePaymentDto.payload) {
      updateData.payload = updatePaymentDto.payload;
    }

    await this.paymentRepository.update(id, updateData);
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async updatePaymentStatus(
    id: string,
    updateStatusDto: UpdatePaymentStatusDto,
  ): Promise<PaymentEntity> {
    await this.paymentRepository.update(id, {
      status: updateStatusDto.status,
      processedAt: new Date(),
    });
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    const result = await this.paymentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
  }

  // Activity Log operations
  async createActivityLog(
    createActivityLogDto: CreateActivityLogDto,
  ): Promise<ActivityLogEntity> {
    const activityLog = this.activityLogRepository.create({
      tenantId: createActivityLogDto.tenantId,
      actorId: createActivityLogDto.actorId,
      action: createActivityLogDto.action,
      metadata: createActivityLogDto.metadata,
    });
    return this.activityLogRepository.save(activityLog);
  }

  async getAllActivityLogs(query: ActivityLogQueryDto) {
    const { page = 1, limit = 10, tenantId, actorId, action } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<ActivityLogEntity> = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (actorId) {
      where.actorId = actorId;
    }
    if (action) {
      where.action = Like(`%${action}%`);
    }

    const [data, total] = await this.activityLogRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['tenant', 'actor'],
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Activity logs retrieved successfully',
      meta: {
        page,
        limit,
        total,
        filters: {
          tenantId: tenantId ?? null,
          actorId: actorId ?? null,
          action: action ?? null,
        },
      },
      data,
    };
  }

  async getActivityLogById(id: string): Promise<ActivityLogEntity> {
    const activityLog = await this.activityLogRepository.findOne({
      where: { id },
      relations: ['tenant', 'actor'],
    });
    if (!activityLog) {
      throw new NotFoundException(`Activity log with id ${id} not found`);
    }
    return activityLog;
  }

  async deleteActivityLog(id: string): Promise<void> {
    const result = await this.activityLogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity log with id ${id} not found`);
    }
  }
  async getStats() {
    const totalTenants = await this.tenantRepository.count({
      where: { status: 'active' },
    });
    const totalUsers = await this.userRepository.count();
    
    // Calculate total revenue from processed payments
    const { sum } = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amountCents)', 'sum')
      .where('payment.status = :status', { status: 'succeeded' })
      .getRawOne();

    const totalRevenue = sum ? parseInt(sum) / 100 : 0; // Convert cents to main currency unit

    return {
      activeTenants: totalTenants,
      totalUsers: totalUsers,
      totalRevenue: totalRevenue,
      systemHealth: '99.9%', // Mocked for now, or implement real health check logic
    };
  }
}
