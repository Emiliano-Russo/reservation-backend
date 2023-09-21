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
} from '@nestjs/common';
import { ReservationCreateDto } from './entities/reservation-create.dto';
import { ReservationUpdateDto } from './entities/reservation-update.dto';
import { ReservationService } from './reservation.service';
import { RatingDto } from './entities/rating.dto';
import { AcceptStatus } from './entities/reservation.entity';
import { ScheduleProposedDto } from './entities/schedule-proposed.dto';
import { UserResponseProposedScheduleDto } from './entities/user-response-proposed-schedule.dto';
import { PaginationParametersDto } from 'src/helpers/pagination-parameters.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // el last key string viene asi
  //   lastKey={"id":"0da6fa7b-cc57-42a9-9c32-4758f5554723","createdAt":1695234660932,"userId":"4e335d83-2fda-49d7-9a34-58950ff09d3b"}
  @Get()
  async getReservations(
    @Query('businessId') businessId?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('lastKey') lastKeyStr?: string,
  ) {
    let lastKey = null;

    if (lastKeyStr) {
      try {
        lastKey = JSON.parse(lastKeyStr);
      } catch (error) {
        throw new BadRequestException('Invalid lastKey format');
      }
    }
    console.log('CONTROLLER LAST KEY: ', lastKey);

    if (businessId)
      return this.reservationService.getReservationByBusinessId(
        businessId,
        parseInt(limit),
        lastKey,
      );
    if (userId)
      return this.reservationService.getReservationsByUserId(
        userId,
        parseInt(limit),
        lastKey,
      );
  }

  @Post()
  async createReservation(@Body() createReservationDto: ReservationCreateDto) {
    return this.reservationService.createReservation(createReservationDto);
  }

  @Patch('scheduleProposed/:id')
  async businessProposedSchedule(
    @Param('id') id: string,
    @Body() dto: ScheduleProposedDto,
  ) {
    console.log('dto: ', dto);
    console.log('id: ', id);
    return this.reservationService.businessProposedSchedule(id, dto.date);
  }

  @Patch('responseSchedulePropose/:id')
  async userResponseProposedSchedule(
    @Param('id') id: string,
    @Body() dto: UserResponseProposedScheduleDto,
  ) {
    return this.reservationService.userResponseProposedSchedule(id, dto.value);
  }

  @Patch(':id')
  async updateReservation(
    @Param('id') id: string,
    @Body() updateReservationDto: ReservationUpdateDto,
  ) {
    return this.reservationService.updateReservation(id, updateReservationDto);
  }

  @Patch('rate/:id')
  async rateReservation(@Param('id') id: string, @Body() ratingDto: RatingDto) {
    return this.reservationService.rateReservation(id, ratingDto);
  }

  @Delete(':id')
  async removeReservation(@Param('id') id: string) {
    return this.reservationService.removeReservation(id);
  }
}
