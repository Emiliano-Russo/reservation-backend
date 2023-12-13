import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationCreateDto } from './entities/reservation-create.dto';
import { ReservationUpdateDto } from './entities/reservation-update.dto';
import { ReservationService } from './reservation.service';
import { RatingDto } from './entities/rating.dto';
import { PaginationDto } from 'src/interfaces/pagination.dto';
import { AcceptStatus } from './entities/negotiable.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getReservations(
    @Query() paginationDto: PaginationDto,
    @Query('businessId') businessId?: string,
    @Query('userId') userId?: string,
    @Query('search') search: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    if (businessId) {
      return this.reservationService.getReservationByBusinessId(
        businessId,
        paginationDto,
        search,
        startDate,
        endDate,
        status,
      );
    }
    if (userId) {
      return this.reservationService.getReservationsByUserId(
        userId,
        paginationDto,
        search,
        startDate,
        endDate,
        status,
      );
    }
    throw new BadRequestException('Provide either businessId or userId');
  }

  @UseGuards(JwtAuthGuard)
  @Get('latest/:businessId')
  async getLastReservationByBusinessId(
    @Param('businessId') businessId: string,
  ): Promise<Reservation> {
    return this.reservationService.getLastReservationByBusinessId(businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReservation(@Body() createReservationDto: ReservationCreateDto) {
    return this.reservationService.createReservation(createReservationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('scheduleProposed/:id')
  async businessProposedSchedule(
    @Param('id') id: string,
    @Body('date') date: string,
  ) {
    return this.reservationService.businessProposedSchedule(id, date);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('responseSchedulePropose/:id')
  async userResponseProposedSchedule(
    @Param('id') id: string,
    @Body('value') value: AcceptStatus,
  ) {
    return this.reservationService.userResponseProposedSchedule(id, value);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateReservation(
    @Param('id') id: string,
    @Body() updateReservationDto: ReservationUpdateDto,
  ) {
    return this.reservationService.updateReservation(id, updateReservationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('rate/:id')
  async rateReservation(@Param('id') id: string, @Body() ratingDto: RatingDto) {
    return this.reservationService.rateReservation(id, ratingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeReservation(@Param('id') id: string) {
    return this.reservationService.removeReservation(id);
  }
}
