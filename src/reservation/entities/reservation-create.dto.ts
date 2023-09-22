import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Negotiable } from './negotiable.entity';

export class ReservationCreateDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsOptional()
  negotiable?: Negotiable;
}
