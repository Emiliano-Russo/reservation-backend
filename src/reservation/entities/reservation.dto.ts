import { IsNotEmpty } from 'class-validator';

export class ReservationDto {
    id?: string

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    businessId: string;

    @IsNotEmpty()
    date: Date

    @IsNotEmpty()
    status: string;
}