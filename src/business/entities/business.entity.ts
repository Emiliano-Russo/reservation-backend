import * as dynamoose from 'dynamoose';
import { AnyItem } from 'dynamoose/dist/Item';

export enum BusinessStatus {
  Pending = 'Pending',
  Operating = 'Operating',
  Closed = 'Closed',
}

export enum WeekDays {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

const MapSchema = new dynamoose.Schema({
  pointX: String,
  pointY: String,
});

const ShiftSchema = new dynamoose.Schema({
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
});

const AvailabilitySchema = new dynamoose.Schema({
  day: { type: String, enum: Object.values(WeekDays), required: true },
  shifts: { type: Array, schema: [{ type: Object, schema: ShiftSchema }] },
  open: { type: Boolean, required: true },
});

const BusinessSchema = new dynamoose.Schema({
  id: { type: String, hashKey: true },
  ownerId: { type: String, required: true },
  typeId: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: { type: Object, schema: MapSchema, required: true },
  activePremiumSubscriptionID: { type: String },
  logoURL: { type: String },
  multimediaURL: { type: Array, schema: [String] },
  description: { type: String },
  assistantsID: { type: Array, schema: [String] },
  pendingInvitationsID: { type: Array, schema: [String] },
  status: { type: String, enum: Object.values(BusinessStatus), required: true },
  availability: {
    type: Array,
    schema: [{ type: Object, schema: AvailabilitySchema }],
    required: true,
  },
});

export interface IBusiness extends AnyItem {
  id: String;
  ownerId: String;
  typeId: String;
  name: String;
  address: String;
  coordinates: Object;
  activePremiumSubscriptionID: String;
  logoURL: String;
  multimediaURL: Array<String>;
  description: String;
  assistantsID: Array<String>;
  pendingInvitationsID: Array<String>;
  status: BusinessStatus;
  availability: Array<IAvailability>;
}

export interface IAvailability extends AnyItem {
  day: WeekDays;
  shfits: Array<IShift>;
  open: Boolean;
}

export interface IShift extends AnyItem {
  openingTime: String;
  closingTime: String;
}

export const Business = dynamoose.model<IBusiness>('Business', BusinessSchema);
