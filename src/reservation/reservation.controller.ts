import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationDto } from "./entities/reservation.dto";
import { ReservationUpdateDto } from "./entities/reservation-update.dto";


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

    @Patch(":id")
    async updateReservation(
        @Param('id') id: string,
        @Body() updateReservationDto: ReservationUpdateDto
    ) {
        return this.reservationService.updateReservation(id, updateReservationDto);
    }
}