import { Controller, Get, Query } from "@nestjs/common";
import { ReservationService } from "./reservation.service";


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
}