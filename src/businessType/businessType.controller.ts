import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { BusinessTypeService } from "./businessType.service";
import { BusinessTypeCreateDto } from "./entities/businessType-create.dto";
import { BusinessTypeUpdateDto } from "./entities/businessType-update.dto";


@Controller('businessType')
export class BusinessTypeController {

    constructor(
        private readonly businessTypeService: BusinessTypeService,
    ) {
    }

    @Get()
    async getBusinessTypes() {
        return this.businessTypeService.getBusinessTypes();
    }

    @Get()
    async getBusinessType(
        @Query('businessTypeId') businessTypeId: string
    ) {
        return this.businessTypeService.getBusinessType(businessTypeId);
    }

    @Post()
    async createBusinessType(
        @Body() createBusinessTypeDto: BusinessTypeCreateDto
    ) {
        console.log("what we got... ", createBusinessTypeDto);
        return this.businessTypeService.createBusinessType(createBusinessTypeDto);
    }

    @Patch(":id")
    async updateBusinessType(
        @Param('id') id: string,
        @Body() updateBusinessTypeDto: BusinessTypeUpdateDto
    ) {
        return this.businessTypeService.updateBusinessType(id, updateBusinessTypeDto);
    }

    @Delete(":id")
    async removeBusinessType(
        @Param('id') id: string
    ) {
        return this.businessTypeService.removeBusinessType(id);
    }
}