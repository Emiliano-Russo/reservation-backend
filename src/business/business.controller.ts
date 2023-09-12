import { Controller, Get, Query } from '@nestjs/common';
import { BusinessService } from './business.service';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  async getBusinessById(@Query('businessId') businessId: string) {
    return this.businessService.getBusinessById(businessId);
  }

  @Get('/owner')
  async getBusinessByOwnerId(@Query('ownerId') ownerId: string) {
    return this.businessService.getBusinessByOwnerId(ownerId);
  }

  @Get('/type')
  async getBusinessByTypeId(@Query('typeId') typeId: string) {
    return this.businessService.getBusinessByTypeId(typeId);
  }

  @Get('/premiumSubscription')
  async getBusinessByActivePremiumSubscriptionId(
    @Query('activePremiumSubscriptionId') activePremiumSubscriptionId: string,
  ) {
    return this.businessService.getBusinessByActivePremiumSubscriptionId(
      activePremiumSubscriptionId,
    );
  }
}
