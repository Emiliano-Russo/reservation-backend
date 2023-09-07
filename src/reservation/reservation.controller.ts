import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationCreateDto } from './entities/reservation-create.dto';
import { ReservationUpdateDto } from './entities/reservation-update.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  async getReservations(@Query('businessId') businessId: string) {
    return this.reservationService.getReservationByBusinessId(businessId);
  }

  @Post()
  async createReservation(@Body() createReservationDto: ReservationCreateDto) {
    return this.reservationService.createReservation(createReservationDto);
  }

  @Patch(':id')
  async updateReservation(
    @Param('id') id: string,
    @Body() updateReservationDto: ReservationUpdateDto,
  ) {
    return this.reservationService.updateReservation(id, updateReservationDto);
  }

  @Delete(':id')
  async removeReservation(@Param('id') id: string) {
    return this.reservationService.removeReservation(id);
  }
}
