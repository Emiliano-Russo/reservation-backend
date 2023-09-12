import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  id?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsNotEmpty()
  reservationDate: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExtraDto)
  extras?: ExtraDto[];
}
