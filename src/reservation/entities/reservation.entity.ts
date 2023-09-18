import * as dynamoose from 'dynamoose';
import { AnyItem } from 'dynamoose/dist/Item';

export enum ReservationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Realized = 'Realized',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected',
  NotAttended = 'NotAttended',
}

export enum AcceptStatus {
  Unanswered = 'Unanswered',
  Accepted = 'Accepted',
  NotAccepted = 'NotAccepted',
}

const RangeSchema = new dynamoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: false },
});

const NegotiableSchema = new dynamoose.Schema({
  dateRange: RangeSchema,
  timeRange: RangeSchema,
  businessProposedSchedule: { type: String, required: false },
  acceptedBusinessProposed: {
    type: String,
    enum: Object.values(AcceptStatus),
    required: false,
  },
});

const ExtraSchema = new dynamoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  labelFirst: { type: Boolean, default: true },
});

const ReservationSchema = new dynamoose.Schema({
  id: { type: String, hashKey: true },
  userId: { type: String, required: true },
  businessId: { type: String, required: true },
  businessName: { type: String, required: true },
  userName: { type: String, required: true },
  reservationDate: { type: Date, required: false },
  rating: { type: Number, required: false, default: null },
  comment: { type: String, required: false, default: null },
  status: {
    type: String,
    enum: Object.values(ReservationStatus),
    required: true,
  },
  extras: {
    type: Array,
    schema: [ExtraSchema], // Esquema para los extras
    required: false,
  },
  negotiable: {
    type: Object,
    schema: NegotiableSchema,
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
});

interface Range {
  start: any;
  end?: any;
}

export interface Negotiable {
  dateRange?: Range;
  timeRange?: Range;
  businessProposedSchedule?: String;
  acceptedBusinessProposed?: AcceptStatus;
}

export interface IExtra {
  label: string;
  value: string;
  labelFirst: boolean;
}

export interface IReservation extends AnyItem {
  id: string;
  userId: string;
  businessId: string;
  businessName: string;
  userName: string;
  rating: number;
  comment: string;
  reservationDate?: Date;
  status: ReservationStatus;
  extras?: IExtra[];
  negotiable?: Negotiable;
  createdAt?: Date;
}

export const Reservation = dynamoose.model<IReservation>(
  'Reservation',
  ReservationSchema,
);
