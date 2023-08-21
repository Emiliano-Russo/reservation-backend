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

    async updateReservation(createReservationDto: ReservationDto): Promise<any> {
        const reservation = Reservation.get(createReservationDto.id);

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        return Reservation.update({
            id: createReservationDto.id,
            businessId: createReservationDto.businessId,
            reservationDate: new Date(createReservationDto.date),
            status: this._reservationStatusConverter(createReservationDto.status),
        });
    }

    _reservationStatusConverter(reservationStatus: String): ReservationStatus {
        switch (reservationStatus) {
            case 'Pending':
                return ReservationStatus.Pending
            case 'Confirmed':
                return ReservationStatus.Confirmed
            case 'Realized':
                return ReservationStatus.Realized
            case 'Cancelled':
                return ReservationStatus.Cancelled
            case 'Rejected':
                return ReservationStatus.Rejected
            case 'NotAttended':
                return ReservationStatus.NotAttended
            default:
                throw new Error("Error en la reservación")
        }
    }
}