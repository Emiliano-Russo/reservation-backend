import * as dynamoose from 'dynamoose';

const ReservationSchema = new dynamoose.Schema({
    id: { type: String, hashKey: true },
    userId: { type: String, required: true },
    businessId: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Realized', 'Cancelled', 'Rejected', 'NotAttended'],
        required: true
    }
});

export const Reservation = dynamoose.model("Reservation", ReservationSchema);