import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { BusinessService } from "./business.service";
import { BusinessCreateDto } from "./entities/business-create.dto";

@Controller('business')
export class BusinessController {

    constructor(
        private readonly businessService: BusinessService,
    ) {
    }

    @Get()
    async getBusinessById(
        @Query('businessId') businessId: string
    ) {
        return this.businessService.getBusinessById(businessId);
    }

    @Get("/owner")
    async getBusinessByOwnerId(
        @Query('ownerId') ownerId: string
    ) {
        return this.businessService.getBusinessByOwnerId(ownerId);
    }

    @Get("/type")
    async getBusinessByTypeId(
        @Query('typeId') typeId: string
    ) {
        return this.businessService.getBusinessByTypeId(typeId);
    }

    @Get("/premiumSubscription")
    async getBusinessByActivePremiumSubscriptionId(
        @Query('activePremiumSubscriptionId') activePremiumSubscriptionId: string
    ) {
        return this.businessService.getBusinessByActivePremiumSubscriptionId(activePremiumSubscriptionId);
    }

    @Post()
    async createBusiness(
        @Body() createBusinessDto: BusinessCreateDto
    ) {
        console.log("what we got... ", createBusinessDto);
        return this.businessService.createBusiness(createBusinessDto);
    }

    @Delete(":id")
    async removeBusiness(
        @Param('id') id: string
    ) {
        return this.businessService.removeBusiness(id);
    }
}