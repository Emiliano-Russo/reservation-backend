import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { BusinessStatus, IAvailability } from './business.entity';

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
  @IsNotEmpty()
  coordinates: any; // <-- Considerar una validación más específica aquí

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

  @IsNotEmpty()
  @IsArray()
  availability: IAvailability[];
}
