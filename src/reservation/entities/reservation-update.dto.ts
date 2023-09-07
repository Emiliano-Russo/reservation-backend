import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReservationStatus } from './reservation.entity';

export class ReservationUpdateDto {
    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsEnum(ReservationStatus)
    status?: ReservationStatus;
}