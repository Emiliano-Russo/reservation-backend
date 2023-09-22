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
import { BusinessTypeService } from './businessType.service';
import { BusinessTypeCreateDto } from './entities/businessType-create.dto';
import { BusinessTypeUpdateDto } from './entities/businessType-update.dto';
import { PaginationDto } from 'src/interfaces/pagination.dto';

@Controller('businessType')
export class BusinessTypeController {
  constructor(private readonly businessTypeService: BusinessTypeService) {}

  // @UseGuards(JwtAuthGuard)
  @Get()
  async getBusinessTypesOrType(
    @Query() paginationDto: PaginationDto,
    @Query('businessTypeId') businessTypeId?: string,
  ) {
    if (businessTypeId) {
      return this.businessTypeService.getBusinessType(businessTypeId);
    }
    return this.businessTypeService.getBusinessTypes(paginationDto);
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
