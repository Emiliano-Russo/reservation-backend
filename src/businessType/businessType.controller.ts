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
import { BusinessTypeService } from './businessType.service';
import { BusinessTypeCreateDto } from './entities/businessType-create.dto';
import { BusinessTypeUpdateDto } from './entities/businessType-update.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('businessType')
export class BusinessTypeController {
  constructor(private readonly businessTypeService: BusinessTypeService) {}

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
