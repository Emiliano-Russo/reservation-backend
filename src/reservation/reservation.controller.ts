import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationDto } from "./entities/reservation.dto";


@Controller('reservation')
export class ReservationController {

    constructor(
        private readonly reservationService: ReservationService,
    ) {
    }

    @Get()
    async getReservations(
        @Query('businessId') businessId: string
    ) {
        return this.reservationService.getReservationByBusinessId(businessId);
    }

    @Post()
    async createReservation(
        @Body() createReservationDto: ReservationDto
    ) {
        console.log("what we got... ", createReservationDto);
        return this.reservationService.createReservation(createReservationDto);
    }
}