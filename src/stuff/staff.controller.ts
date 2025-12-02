import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StaffGuard } from './staff.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, CheckinDto } from './staff.dto';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * STAFF MANAGEMENT ROUTES
   */

  // POST /staff/register
  @Post('register')
  @UseGuards(StaffGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.CREATED)
  async registerStaff(
    @CurrentUser() user: any,
    @Body() createStaffDto: CreateStaffDto,
  ) {
    const staff = await this.staffService.registerStaff(
      user.tenantId,
      createStaffDto,
    );

    return {
      statusCode: 201,
      message: 'Staff member registered successfully',
      data: staff,
    };
  }

  // GET /staff/me
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentStaff(@CurrentUser() user: any) {
    const staff = await this.staffService.getCurrentStaff(user.id);

    return {
      statusCode: 200,
      message: 'Staff profile retrieved successfully',
      data: staff,
    };
  }

  // PUT /staff/me
  @Put('me')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.OK)
  async updateStaffProfile(
    @CurrentUser() user: any,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    const staff = await this.staffService.updateStaffProfile(
      user.id,
      updateStaffDto,
    );

    return {
      statusCode: 200,
      message: 'Staff profile updated successfully',
      data: staff,
    };
  }

  // PATCH /staff/me/email?email=new@mail.com
  @Patch('me/email')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.OK)
  async updateStaffEmail(
    @CurrentUser() user: any,
    @Query('email') newEmail: string,
  ) {
    const staff = await this.staffService.updateStaffEmail(user.id, newEmail);

    return {
      statusCode: 200,
      message: 'Staff email updated successfully',
      data: staff,
    };
  }

  // DELETE /staff/:id
  @Delete(':id')
  @UseGuards(StaffGuard)
  @HttpCode(HttpStatus.OK)
  async deleteStaff(
    @Param('id', new ParseUUIDPipe()) staffId: string,
  ) {
    const result = await this.staffService.deleteStaff(staffId);

    return {
      statusCode: 200,
      message: result.message,
    };
  }

  /**
   * TICKET CHECK-IN & TICKET LIST
   */

  // POST /staff/checkin
  @Post('checkin')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.OK)
  async checkInTicket(
    @CurrentUser() user: any,
    @Body() checkinDto: CheckinDto,
  ) {
    // Use staff ID from current user context
    const result = await this.staffService.checkInTicket(user.id, checkinDto);

    return {
      statusCode: 200,
      message: result.message,
      data: result.ticket,
    };
  }

  // GET /staff/tickets
  // Optional simple pagination with primitive query params
  @Get('tickets')
  @HttpCode(HttpStatus.OK)
  async getAssignedTickets(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    const limitNumber = limit ? parseInt(limit, 10) || 20 : 20;

    const result = await this.staffService.getAssignedTickets(
      user.tenantId,
      pageNumber,
      limitNumber,
    );

    return {
      statusCode: 200,
      message: 'Tickets retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit: limitNumber,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNumber),
      },
    };
  }

  /**
   * ACTIVITY LOG ROUTES (1:N Staff → ActivityLogs)
   */

  // GET /staff/:id/logs
  @Get(':id/logs')
  @HttpCode(HttpStatus.OK)
  async getStaffActivityLogs(
    @Param('id', new ParseUUIDPipe()) staffId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    const limitNumber = limit ? parseInt(limit, 10) || 20 : 20;

    const result = await this.staffService.getStaffActivityLogs(
      staffId,
      pageNumber,
      limitNumber,
    );

    return {
      statusCode: 200,
      message: 'Activity logs retrieved successfully',
      data: result.data,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNumber),
      },
    };
  }

  // POST /staff/:id/logs
  @Post(':id/logs')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @HttpCode(HttpStatus.CREATED)
  async createActivityLog(
    @Param('id', new ParseUUIDPipe()) staffId: string,
    @Body()
    logData: {
      action: string;
      description: string;
      metadata?: Record<string, any>;
    },
  ) {
    const log = await this.staffService.createActivityLog(
      staffId,
      logData.action,
      logData.description,
      logData.metadata,
    );

    return {
      statusCode: 201,
      message: 'Activity log created successfully',
      data: log,
    };
  }

  // DELETE /staff/:id/logs/:logId
  @Delete(':id/logs/:logId')
  @UseGuards(StaffGuard)
  @HttpCode(HttpStatus.OK)
  async deleteActivityLog(
    @Param('logId', new ParseUUIDPipe()) logId: string,
  ) {
    const result = await this.staffService.deleteActivityLog(logId);

    return {
      statusCode: 200,
      message: result.message,
    };
  }

  /**
   * REPORTING & SEARCH
   */

  // GET /staff/attendance-records
  @Get('attendance-records')
  @HttpCode(HttpStatus.OK)
  async getAttendanceRecords(
    @CurrentUser() user: any,
    @Query('eventId') eventId?: string,
  ) {
    const records = await this.staffService.getAttendanceRecords(
      user.tenantId,
      eventId,
    );

    return {
      statusCode: 200,
      message: 'Attendance records retrieved successfully',
      data: records,
      count: records.length,
    };
  }

  // GET /staff/search/tickets?q=...
  @Get('search/tickets')
  @HttpCode(HttpStatus.OK)
  async searchTickets(
    @CurrentUser() user: any,
    @Query('q') searchTerm: string,
  ) {
    if (!searchTerm || searchTerm.length < 2) {
      return {
        statusCode: 400,
        message: 'Search term must be at least 2 characters',
        data: [],
      };
    }

    const tickets = await this.staffService.searchTickets(
      user.tenantId,
      searchTerm,
    );

    return {
      statusCode: 200,
      message: 'Search completed successfully',
      data: tickets,
      count: tickets.length,
    };
  }

  /**
   * EVENT READ-ONLY ENDPOINTS (Per Plan Requirements)
   */

  // GET /staff/events
  @Get('events')
  @HttpCode(HttpStatus.OK)
  async getTenantEvents(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) || 1 : 1;
    const limitNumber = limit ? parseInt(limit, 10) || 20 : 20;

    const result = await this.staffService.getTenantEvents(
      user.tenantId,
      pageNumber,
      limitNumber,
    );

    return {
      statusCode: 200,
      message: 'Events retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit: limitNumber,
        total: result.total,
        totalPages: Math.ceil(result.total / limitNumber),
      },
    };
  }

  // GET /staff/events/:id
  @Get('events/:id')
  @HttpCode(HttpStatus.OK)
  async getEventById(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ) {
    const event = await this.staffService.getEventById(
      user.tenantId,
      eventId,
    );

    return {
      statusCode: 200,
      message: 'Event retrieved successfully',
      data: event,
    };
  }

  // GET /staff/events/:id/ticket-types
  @Get('events/:id/ticket-types')
  @HttpCode(HttpStatus.OK)
  async getEventTicketTypes(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ) {
    const ticketTypes = await this.staffService.getEventTicketTypes(
      user.tenantId,
      eventId,
    );

    return {
      statusCode: 200,
      message: 'Ticket types retrieved successfully',
      data: ticketTypes,
    };
  }

  // GET /staff/events/:id/capacity
  @Get('events/:id/capacity')
  @HttpCode(HttpStatus.OK)
  async getEventCapacity(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ) {
    const capacity = await this.staffService.getEventCapacity(
      user.tenantId,
      eventId,
    );

    return {
      statusCode: 200,
      message: 'Event capacity retrieved successfully',
      data: capacity,
    };
  }

  /**
   * ORDER LOOKUP ENDPOINTS (Per Plan Requirements)
   */

  // GET /staff/orders/search?email=...
  @Get('orders/search')
  @HttpCode(HttpStatus.OK)
  async searchOrdersByEmail(
    @CurrentUser() user: any,
    @Query('email') email?: string,
    @Query('code') code?: string,
  ) {
    if (email) {
      const orders = await this.staffService.searchOrdersByEmail(
        user.tenantId,
        email,
      );

      return {
        statusCode: 200,
        message: 'Orders found by email',
        data: orders,
        count: orders.length,
      };
    }

    if (code) {
      const order = await this.staffService.searchOrderByCode(
        user.tenantId,
        code,
      );

      if (!order) {
        return {
          statusCode: 404,
          message: 'Order not found',
          data: null,
        };
      }

      return {
        statusCode: 200,
        message: 'Order found by code',
        data: order,
      };
    }

    return {
      statusCode: 400,
      message: 'Either email or code query parameter is required',
      data: [],
    };
  }

  // GET /staff/orders/:id
  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  async getOrderById(
    @CurrentUser() user: any,
    @Param('id', new ParseUUIDPipe()) orderId: string,
  ) {
    const order = await this.staffService.getOrderById(
      user.tenantId,
      orderId,
    );

    return {
      statusCode: 200,
      message: 'Order retrieved successfully',
      data: order,
    };
  }
}
