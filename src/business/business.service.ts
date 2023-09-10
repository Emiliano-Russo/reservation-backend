import { Injectable } from "@nestjs/common";
import { Business, BusinessStatus, IAvailability, IShift, WeekDays } from "./entities/business.entity";
import { BusinessCreateDto } from "./entities/business-create.dto";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BusinessService {

    constructor() {
    }

    async getBusinessById(id: string) {
        const business = await Business.scan("id").eq(id).exec();
        return business;
    }

    async getBusinessByOwnerId(ownerId: string): Promise<any> {
        const business = await Business.scan("ownerId").eq(ownerId).exec();
        return business;
    }

    async getBusinessByTypeId(typeId: string): Promise<any> {
        const business = await Business.scan("typeId").eq(typeId).exec();
        return business;
    }

    async getBusinessByActivePremiumSubscriptionId(activePremiumSubscriptionID: string): Promise<any> {
        const business = await Business.scan("activePremiumSubscriptionID").eq(activePremiumSubscriptionID).exec();
        return business;
    }

    async createBusiness(businessCreateDto: BusinessCreateDto): Promise<any> {
        const business = new Business({
            id: uuidv4(),
            ownerId: businessCreateDto.ownerId,
            typeId: businessCreateDto.typeId,
            name: businessCreateDto.name,
            address: businessCreateDto.address,
            coordinates: businessCreateDto.coordinates,
            activePremiumSubscriptionID: businessCreateDto.activePremiumSubscriptionId,
            logoUrl: businessCreateDto.logoUrl,
            multimediaUrl: businessCreateDto.multimediaURL,
            description: businessCreateDto.description,
            assistantsID: businessCreateDto.assistantsID,
            pendingInvitationsID: businessCreateDto.pendingInvitationsID,
            status: BusinessStatus.Pending,
            availability: businessCreateDto.availability,
        });
        return await business.save();
    }


    _convertAvailabilities(availabilities: Array<IAvailability>) {

        availabilities.map((availability) => {
            availability.day = WeekDays[(availability as IAvailability).day];
            return availability
        });
        console.log(availabilities);
        return availabilities;
    }

    async removeBusiness(id: string) {
        const business = await Business.get(id);

        if (!business) {
            throw new Error('business not found');
        }

        return business.delete();
    }
}