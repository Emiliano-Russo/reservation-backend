import { Injectable } from '@nestjs/common';
import { Business } from './entities/business.entity';

@Injectable()
export class BusinessService {
  constructor() {}

  async getBusinessById(id: string) {
    const business = await Business.get('id');
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
}
