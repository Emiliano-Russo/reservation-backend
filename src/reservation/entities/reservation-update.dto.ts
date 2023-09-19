import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Negotiable, ReservationStatus } from './reservation.entity';

export class ReservationUpdateDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  negotiable?: Negotiable;
}
