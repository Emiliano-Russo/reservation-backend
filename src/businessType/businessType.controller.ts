import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BusinessTypeService } from "./businessType.service";
import { BusinessTypeCreateDto } from "./entities/businessType-create.dto";
import { BusinessTypeUpdateDto } from "./entities/businessType-update.dto";
import { PaginationParametersDto } from "src/helpers/pagination-parameters.dto";

@Controller('businessType')
export class BusinessTypeController {
    constructor(private readonly businessTypeService: BusinessTypeService) { }

    // @UseGuards(JwtAuthGuard)
    @Get()
    async getBusinessTypesOrType(
        @Query('businessTypeId') businessTypeId?: string,
    ) {
        if (businessTypeId) {
            return this.businessTypeService.getBusinessType(businessTypeId);
        }
        return this.businessTypeService.getBusinessTypes();
    }


    @Post()
    async createBusinessType(
        @Body() createBusinessTypeDto: BusinessTypeCreateDto,
    ) {
        return this.businessTypeService.createBusinessType(createBusinessTypeDto);
    }

    @Get()
    async getBusinessTypesPaginated(
        @Body() pagination: PaginationParametersDto
    ) {
        return this.businessTypeService.getBusinessTypesPaginated(pagination);
    }


    @Get()
    async getBusinessTypes() {
        return this.businessTypeService.getBusinessTypes();
    }

    @Patch(':id')
    async updateBusinessType(
        @Param('id') id: string,
        @Body() updateBusinessTypeDto: BusinessTypeUpdateDto,
    ) {
        return this.businessTypeService.updateBusinessType(
            id,
            updateBusinessTypeDto,
        );
    }

    @Delete(':id')
    async removeBusinessType(@Param('id') id: string) {
        return this.businessTypeService.removeBusinessType(id);
    }
}
