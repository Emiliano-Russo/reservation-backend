import { Injectable, NotFoundException } from '@nestjs/common';
import {
    Business,
    BusinessStatus,
    IAvailability,
    IBusiness,
    WeekDays,
} from './entities/business.entity';
import { BusinessCreateDto } from './entities/business-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { BusinessUpdateDto } from './entities/business-update.dto';
import { User } from 'src/user/entities/user.entity';
import { BusinessType } from 'src/businessType/entities/businessType.entity';
import { S3Service } from 'src/shared/s3.service';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { PaginationParametersDto } from "src/helpers/pagination-parameters.dto";

@Injectable()
export class BusinessService {
    constructor(private readonly s3Service: S3Service) { }

    async getBusinessPaginatedById(businessId: string, pagination: PaginationParametersDto) {
        let business = await Business.scan("businessId").eq(businessId).limit(pagination.limit);

        if (pagination.lastKey) {
            business = business.startAt(pagination.lastKey);
        }

        const result = await business.exec();
        return {
            items: result,
            lastKey: result.lastKey || null,
        };
    }

    async getBusinessPaginatedByOwnerId(ownerId: string, pagination: PaginationParametersDto) {
        let business = await Business.scan("ownerId").eq(ownerId).limit(pagination.limit);

        if (pagination.lastKey) {
            business = business.startAt(pagination.lastKey);
        }

        const result = await business.exec();
        return {
            items: result,
            lastKey: result.lastKey || null,
        };
    }

    async getBusinessPaginatedByTypeId(typeId: string, pagination: PaginationParametersDto) {
        let business = await Business.scan("typeId").eq(typeId).limit(pagination.limit);

        if (pagination.lastKey) {
            business = business.startAt(pagination.lastKey);
        }

        const result = await business.exec();
        return {
            items: result,
            lastKey: result.lastKey || null,
        };
    }

    async getBusinessPaginatedByActivePremiumSubscriptionId(activePremiumSubscriptionID: string, pagination: PaginationParametersDto) {
        let business = await Business.scan("activePremiumSubscriptionID").eq(activePremiumSubscriptionID).limit(pagination.limit);

        if (pagination.lastKey) {
            business = business.startAt(pagination.lastKey);
        }

        const result = await business.exec();
        return {
            items: result,
            lastKey: result.lastKey || null,
        };
    }

    async getBusinessById(id: string) {
        const business = await Business.get(id);
        return business;
    }

    async getBusinessByOwnerId(ownerId: string): Promise<any> {
        const business = await Business.scan('ownerId').eq(ownerId).exec();
        return business;
    }

    async getBusinessByTypeId(typeId: string): Promise<any> {
        const business = await Business.scan('typeId').eq(typeId).exec();
        return business;
    }

    async getBusinessByActivePremiumSubscriptionId(
        activePremiumSubscriptionID: string,
    ): Promise<any> {
        const business = await Business.scan('activePremiumSubscriptionID')
            .eq(activePremiumSubscriptionID)
            .exec();
        return business;
    }

    async updateBusiness(
        id: string,
        updateData: BusinessUpdateDto,
        logo?: any,
        banner?: any,
    ): Promise<IBusiness> {
        const business = await Business.get(id);
        console.log('el business:', business);
        if (!business) {
            throw new NotFoundException(`Business with ID ${id} not found`);
        }

        if (logo) {
            console.log('updating logo: ', logo);
            const sanitizedFilename = logo[0].originalname.replace(/\s+/g, '');
            logo[0].originalname = sanitizedFilename;
            await this.s3Service.uploadFile(
                logo[0],
                `business/${business.ownerId}/logo/`,
            );
            business.logoURL = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${business.ownerId}/logo/${sanitizedFilename}`;
        }

        if (banner) {
            console.log('updating banner', banner);
            const sanitizedBannerFilename = banner[0].originalname.replace(
                /\s+/g,
                '',
            );
            banner[0].originalname = sanitizedBannerFilename;
            await this.s3Service.uploadFile(
                banner[0],
                `business/${business.ownerId}/banner/`,
            );
            business.multimediaURL = [
                `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${business.ownerId}/banner/${sanitizedBannerFilename}`,
            ];
        }

        for (const key in updateData) {
            if (Object.prototype.hasOwnProperty.call(updateData, key)) {
                business[key] = updateData[key];
            }
        }

        await business.save();
        return business;
    }

    async createBusiness(
        businessCreateDto: BusinessCreateDto,
        logo: any,
        banner: any,
    ): Promise<any> {
        const owner = await User.get(businessCreateDto.ownerId);
        if (owner == undefined)
            throw new NotFoundException('Owner does not exists');

        const businessType = BusinessType.get(businessCreateDto.typeId);
        if (businessType == undefined)
            throw new NotFoundException('Business Type does not exists');

        let logoUrl =
            'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000'; // URL por defecto
        let bannerUrl =
            'https://i.pinimg.com/564x/08/8c/09/088c099c81191b734e0db14f0e253142.jpg'; // Puedes poner una URL de imagen de banner por defecto aquí

        if (logo) {
            const sanitizedFilename = logo.originalname.replace(/\s+/g, '');
            logo.originalname = sanitizedFilename;
            await this.s3Service.uploadFile(
                logo,
                `business/${businessCreateDto.ownerId}/logo/`,
            );
            logoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${businessCreateDto.ownerId}/logo/${sanitizedFilename}`;
        }

        if (banner) {
            const sanitizedBannerFilename = banner.originalname.replace(/\s+/g, '');
            banner.originalname = sanitizedBannerFilename;
            await this.s3Service.uploadFile(
                banner,
                `business/${businessCreateDto.ownerId}/banner/`,
            );
            bannerUrl = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${businessCreateDto.ownerId}/banner/${sanitizedBannerFilename}`;
        }

        const business = new Business({
            id: uuidv4(),
            ownerId: businessCreateDto.ownerId,
            typeId: businessCreateDto.typeId,
            name: businessCreateDto.name,
            country: businessCreateDto.country,
            department: businessCreateDto.department,
            address: businessCreateDto.address,
            coordinates: businessCreateDto.coordinates,
            logoURL: logoUrl,
            multimediaURL: [bannerUrl], // Si tienes varias URL de multimedia, combínalas aquí.
            description: businessCreateDto.description,
            assistantsID: [],
            pendingInvitationsID: [],
            status: BusinessStatus.Pending,
            totalRatingSum: 0,
            totalRatingsCount: 0,
            averageRating: 0,
            availability: businessCreateDto.availability,
        });

        return await business.save();
    }

    async removeBusiness(id: string) {
        const business = await Business.get(id);

        if (!business) {
            throw new Error('business not found');
        }

        return business.delete();
    }
}
