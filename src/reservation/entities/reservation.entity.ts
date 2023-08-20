import * as dynamoose from 'dynamoose';
import { AnyItem } from "dynamoose/dist/Item";

export enum ReservationStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Realized = 'Realized',
    Cancelled = 'Cancelled',
    Rejected = 'Rejected',
    NotAttended = 'NotAttended'
}

const ReservationSchema = new dynamoose.Schema({
    id: { type: String, hashKey: true },
    userId: { type: String, required: true },
    businessId: { type: String, required: true },
    reservationDate: { type: Date, required: true },
    status: {
        type: String,
        enum: Object.values(ReservationStatus),
        required: true
    },
    createdAt: { type: Date, default: Date.now },
});

export interface IReservation extends AnyItem {
    id: string;
    userId: string;
    businessId: string;
    reservationDate: Date;
    status: ReservationStatus;
    createdAt?: Date;
}

export const Reservation = dynamoose.model<IReservation>("Reservation", ReservationSchema);

