import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Negotiable } from './reservation.entity';

class ExtraDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsBoolean()
  @IsNotEmpty()
  labelFirst: boolean;
}

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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExtraDto)
  extras?: ExtraDto[];

  @IsOptional()
  negotiable?: Negotiable;
}
