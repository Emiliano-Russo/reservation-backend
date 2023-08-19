import { Injectable } from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationService {

    constructor() {
    }

    async getReservationByBusinessId(businessId: string): Promise<any> {

        const reservations = await Reservation.scan("businessId").eq(businessId).exec();
        return reservations;
    }

}