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
import { BusinessCreateDto } from './entities/dto/business-create.dto';
import { BusinessUpdateDto } from './entities/dto/business-update.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { PaginationDto } from 'src/interfaces/pagination.dto';
import { LocationDto } from './entities/location.entity';

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
    console.log('createBusiness: ', createBusinessDto);
    console.log('files: ', files);
    return this.businessService.createBusiness(
      createBusinessDto,
      files.logo ? files.logo[0] : undefined,
      files.banner ? files.banner[0] : undefined,
    );
  }

  @Get()
  async getBusiness(
    @Query() paginationDto: PaginationDto,
    @Query('businessId') businessId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('typeId') typeId?: string,
    @Query('search') search: string = '',
    @Query() locationDto?: LocationDto,
  ) {
    if (businessId) {
      return this.businessService.getBusinessById(businessId);
    } else if (ownerId) {
      return this.businessService.getBusinessByOwnerId(ownerId, paginationDto);
    } else if (typeId) {
      return this.businessService.getBusinessByTypeId(
        typeId,
        paginationDto,
        search,
        locationDto,
      );
    } else {
      throw new BadRequestException('Invalid query parameters.');
    }
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  async updateBusiness(
    @Param('id') id: string,
    @UploadedFiles() files: { logo?: any; banner?: any },
    @Body() businessUpdateDto: BusinessUpdateDto,
  ) {
    return this.businessService.updateBusiness(
      id,
      businessUpdateDto,
      files.logo ? files.logo[0] : undefined,
      files.banner ? files.banner[0] : undefined,
    );
  }

  @Delete(':id')
  async removeBusiness(@Param('id') id: string) {
    return this.businessService.removeBusiness(id);
  }
}
