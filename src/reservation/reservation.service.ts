import { Injectable } from '@nestjs/common';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReservationDto } from './entities/reservation.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReservationService {

    constructor() {
    }

    async getReservationByBusinessId(businessId: string) {
        const reservations = await Reservation.scan("businessId").eq(businessId).exec();
        return reservations;
    }

    async createReservation(createReservationDto: ReservationDto): Promise<any> {
        console.log("creating....");
        const reservation = new Reservation({
            id: uuidv4(),
            userId: createReservationDto.userId,
            businessId: createReservationDto.businessId,
            reservationDate: createReservationDto.date,
            status: ReservationStatus.Pending
        });
        console.log("saving...");
        return await reservation.save();
    }

}