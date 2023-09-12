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
  id?: string;

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
  address: string;

  @IsObject()
  @IsNotEmpty()
  coordinates: Object;

  @IsString()
  @IsOptional()
  activePremiumSubscriptionId: string;

  @IsString()
  @IsOptional()
  logoUrl: string;

  @IsArray()
  @IsOptional()
  multimediaURL: Array<string>;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsOptional()
  assistantsID: Array<string>;

  @IsArray()
  @IsOptional()
  pendingInvitationsID: Array<string>;

  @IsNotEmpty()
  @IsEnum(BusinessStatus)
  status: BusinessStatus;

  @IsNotEmpty()
  @IsArray()
  availability: Array<IAvailability>;
}
