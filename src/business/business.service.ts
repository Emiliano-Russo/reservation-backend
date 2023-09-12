import { Injectable } from '@nestjs/common';
import {
  Business,
  BusinessStatus,
  IAvailability,
  IShift,
  WeekDays,
} from './entities/business.entity';
import { BusinessCreateDto } from './entities/business-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { BusinessUpdateDto } from './entities/business-update.dto';

@Injectable()
export class BusinessService {
  constructor() {}

  async getBusinessById(id: string) {
    const business = await Business.scan('id').eq(id).exec();
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
    businessUpdateDto: BusinessUpdateDto,
  ): Promise<any> {
    const business = await Business.get(id);

    if (!business) {
      throw new Error('Business not found');
    }

    const updateData: any = {};

    updateData.name = businessUpdateDto.name ?? business.name;
    updateData.address = businessUpdateDto.address ?? business.address;
    updateData.coordinates =
      businessUpdateDto.coordinates ?? business.coordinates;
    updateData.activePremiumSubscriptionId =
      businessUpdateDto.activePremiumSubscriptionId ??
      business.activePremiumSubscriptionId;
    updateData.logoUrl = businessUpdateDto.logoUrl ?? business.logoURL;
    updateData.multimediaURL =
      businessUpdateDto.multimediaURL ?? business.multimediaURL;
    updateData.description =
      businessUpdateDto.description ?? business.description;
    updateData.assistantsID =
      businessUpdateDto.assistantsID ?? business.assistantsID;
    updateData.pendingInvitationsID =
      businessUpdateDto.pendingInvitationsID ?? business.pendingInvitationsID;
    updateData.status = businessUpdateDto.status ?? business.status;
    updateData.availability =
      businessUpdateDto.availability ?? business.availability;

    return Business.update(id, updateData);
  }

  async updateBusinessInvitation(
    id: string,
    businessUpdateDto: BusinessUpdateDto,
  ): Promise<any> {
    const business = await Business.get(id);

    if (!business) {
      throw new Error('Business not found');
    }

    const updateData: any = {};

    updateData.pendingInvitationsID = business.pendingInvitationsID;
    var indexInvitationID = (
      updateData.pendingInvitationsID as Array<String>
    )?.indexOf(businessUpdateDto.selectedPendingInvitationID);

    if (businessUpdateDto.acceptInvitation) {
      if (indexInvitationID && indexInvitationID > -1) {
        (updateData.pendingInvitationsID as Array<string>).splice(
          indexInvitationID,
          indexInvitationID,
        );
        (updateData.assistantsID as Array<string>).push(
          businessUpdateDto.selectedPendingInvitationID,
        );
      }
    } else {
      if (indexInvitationID > -1) {
        (updateData.pendingInvitationsID as Array<string>).splice(
          indexInvitationID,
          indexInvitationID,
        );
      }
    }

    return Business.update(id, updateData);
  }

  async updateBusinessStatus(id: string, businessUpdateDto: BusinessUpdateDto) {
    const business = await Business.get(id);

    if (!business) {
      throw new Error('Business not found');
    }

    const updateData: any = {};

    updateData.status = businessUpdateDto.status ?? business.status;

    return Business.update(id, updateData);
  }

  async createBusiness(businessCreateDto: BusinessCreateDto): Promise<any> {
    const business = new Business({
      id: uuidv4(),
      ownerId: businessCreateDto.ownerId,
      typeId: businessCreateDto.typeId,
      name: businessCreateDto.name,
      address: businessCreateDto.address,
      coordinates: businessCreateDto.coordinates,
      activePremiumSubscriptionID:
        businessCreateDto.activePremiumSubscriptionId,
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
      return availability;
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
