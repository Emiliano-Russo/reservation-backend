import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReservationStatus } from './reservation.entity';
import { Negotiable } from './negotiable.entity';

export class ReservationUpdateDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  negotiable?: Negotiable;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
