import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { BusinessStatus, IAvailability } from './business.entity';


export class BusinessUpdateDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsObject()
    @IsOptional()
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

    @IsBoolean()
    @IsOptional()
    acceptInvitation: boolean;

    @IsArray()
    @IsOptional()
    assistantsID: Array<string>;

    @IsString()
    @IsOptional()
    selectedPendingInvitationID: string;

    @IsArray()
    @IsOptional()
    pendingInvitationsID: Array<string>;

    @IsOptional()
    @IsEnum(BusinessStatus)
    status: BusinessStatus;

    @IsOptional()
    @IsArray()
    availability: Array<IAvailability>;
}