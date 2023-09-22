import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BusinessStatus } from './business.entity';
import { Type } from 'class-transformer';
import { WeekDays } from './availability.entity';

class CoordinatesDto {
  @IsString()
  @IsNotEmpty()
  pointX: string;

  @IsString()
  @IsNotEmpty()
  pointY: string;
}

export class ShiftDto {
  @IsString()
  @IsNotEmpty()
  openingTime: string;

  @IsString()
  @IsNotEmpty()
  closingTime: string;
}

class AvailabilityDto {
  @IsNotEmpty()
  @IsEnum(WeekDays)
  day: WeekDays;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftDto)
  shifts: ShiftDto[];

  @IsBoolean()
  @IsNotEmpty()
  open: boolean;
}

export class BusinessCreateDto {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  typeId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CoordinatesDto) // Esto es necesario para que class-transformer instancie correctamente el objeto nested
  coordinates: CoordinatesDto;

  @IsString()
  @IsOptional()
  logoURL: string;

  @IsArray()
  @IsOptional()
  multimediaURL: string[];

  @IsString()
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsEnum(BusinessStatus)
  status: BusinessStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  availability: AvailabilityDto[];
}
