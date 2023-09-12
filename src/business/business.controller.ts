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
