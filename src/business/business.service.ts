import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Business,
  BusinessStatus,
  IAvailability,
  WeekDays,
} from './entities/business.entity';
import { BusinessCreateDto } from './entities/business-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { BusinessUpdateDto } from './entities/business-update.dto';
import { User } from 'src/user/entities/user.entity';
import { BusinessType } from 'src/businessType/entities/businessType.entity';
import { S3Service } from 'src/shared/s3.service';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';

@Injectable()
export class BusinessService {
  constructor(private readonly s3Service: S3Service) {}

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
      address: businessCreateDto.address,
      coordinates: businessCreateDto.coordinates,
      logoURL: logoUrl,
      multimediaURL: [bannerUrl], // Si tienes varias URL de multimedia, combínalas aquí.
      description: businessCreateDto.description,
      assistantsID: [],
      pendingInvitationsID: [],
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
