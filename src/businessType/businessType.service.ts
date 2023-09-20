import { Injectable } from '@nestjs/common';
import { BusinessType } from './entities/businessType.entity';
import { BusinessTypeCreateDto } from './entities/businessType-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { BusinessTypeUpdateDto } from './entities/businessType-update.dto';
import { PaginationParametersDto } from 'src/helpers/pagination-parameters.dto';
import { PaginatedResponse } from 'src/interfaces/PaginatedResponse';
import { S3Service } from 'src/shared/s3.service';

@Injectable()
export class BusinessTypeService {
  constructor(private readonly s3Service: S3Service) { }

  async getBusinessTypes(
    limit: number,
    lastKey: string,
  ): Promise<PaginatedResponse> {
    let businessTypes = await BusinessType.scan().limit(limit);
    console.log('limit: ', limit);

    if (lastKey) {
      businessTypes = businessTypes.startAt({ id: lastKey });
    }

    const result = await businessTypes.exec();
    return {
      items: result,
      lastKey: result.lastKey || null,
    };
  }

  async getBusinessType(id: string) {
    return BusinessType.get(id);
  }

  async createBusinessType(
    createBusinessTypeDto: BusinessTypeCreateDto,
  ): Promise<any> {
    const businessType = new BusinessType({
      id: uuidv4(),
      name: createBusinessTypeDto.name,
      description: createBusinessTypeDto.description,
      icon: createBusinessTypeDto.icon,
      controls: createBusinessTypeDto.controls,
    });

    return await businessType.save();
  }

  async updateBusinessType(
    id: string,
    updateDto: BusinessTypeUpdateDto,
  ): Promise<any> {
    const businessType = await BusinessType.get(id);
    console.log('obtuvimos el businessType: ', businessType);

    if (!businessType) {
      throw new Error('BusinessType not found');
    }

    const updateData: any = {
      ...businessType, // Spread para mantener los valores actuales
      ...updateDto, // Spread para sobrescribir con los nuevos valores proporcionados
    };

    delete updateData.id;

    return BusinessType.update({ id }, updateData);
  }

  async removeBusinessType(id: string) {
    const businessType = await BusinessType.get(id);

    if (!businessType) {
      throw new Error('businessType not found');
    }

    await this.s3Service.deleteFile(businessType.icon);

    return businessType.delete();
  }
}

