import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessCreateDto } from './entities/business-create.dto';
import { BusinessUpdateDto } from './entities/business-update.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async createBusiness(
    @Body() createBusinessDto: BusinessCreateDto,
    @UploadedFiles() files: { logo?: any; banner?: any },
  ) {
    // Convertir la cadena JSON 'coordinates' en un objeto.
    if (typeof createBusinessDto.coordinates === 'string') {
      try {
        createBusinessDto.coordinates = JSON.parse(
          createBusinessDto.coordinates,
        );
      } catch (error) {
        throw new BadRequestException('Invalid coordinates format');
      }
    }

    // Convertir la cadena JSON 'availability' en un array.
    if (typeof createBusinessDto.availability === 'string') {
      try {
        createBusinessDto.availability = JSON.parse(
          createBusinessDto.availability,
        );
      } catch (error) {
        throw new BadRequestException('Invalid availability format');
      }
    }

    console.log('DTO received: ', createBusinessDto);
    console.log('Logo received: ', files.logo);
    console.log('Banner received: ', files.banner);

    return this.businessService.createBusiness(
      createBusinessDto,
      files.logo ? files.logo[0] : undefined,
      files.banner ? files.banner[0] : undefined,
    );
  }

  @Get()
  async getBusiness(
    @Query('businessId') businessId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('typeId') typeId?: string,
    @Query('activePremiumSubscriptionId') activePremiumSubscriptionId?: string,
  ) {
    if (businessId) {
      return this.businessService.getBusinessById(businessId);
    } else if (ownerId) {
      return this.businessService.getBusinessByOwnerId(ownerId);
    } else if (typeId) {
      return this.businessService.getBusinessByTypeId(typeId);
    } else if (activePremiumSubscriptionId) {
      return this.businessService.getBusinessByActivePremiumSubscriptionId(
        activePremiumSubscriptionId,
      );
    } else {
      throw new BadRequestException('Invalid query parameters.');
    }
  }

  @Patch(':id')
  async UpdateBusiness(
    @Param('id') id: string,
    @Body() businessUpdateDto: BusinessUpdateDto,
  ) {
    console.log('what we got... ', businessUpdateDto);
    return this.businessService.updateBusiness(id, businessUpdateDto);
  }

  @Patch(':id')
  async updateBusinessInvitation(
    @Param('id') id: string,
    @Body() businessUpdateDto: BusinessUpdateDto,
  ) {
    console.log('what we got... ', businessUpdateDto);
    return this.businessService.updateBusinessInvitation(id, businessUpdateDto);
  }

  @Patch(':id')
  async updateBusinessStatus(
    @Param('id') id: string,
    @Body() businessUpdateDto: BusinessUpdateDto,
  ) {
    console.log('what we got... ', businessUpdateDto);
    return this.businessService.updateBusinessStatus(id, businessUpdateDto);
  }

  @Delete(':id')
  async removeBusiness(@Param('id') id: string) {
    return this.businessService.removeBusiness(id);
  }
}