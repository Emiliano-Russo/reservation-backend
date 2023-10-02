import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessType } from './entities/businessType.entity';
import { BusinessTypeCreateDto } from './entities/businessType-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { BusinessTypeUpdateDto } from './entities/businessType-update.dto';
import {
  PaginatedResponse,
  PaginationDto,
} from 'src/interfaces/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BusinessTypeService {
  constructor(
    @InjectRepository(BusinessType)
    private readonly businessTypeRepository: Repository<BusinessType>,
  ) {}

  async getBusinessTypes(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse> {
    const { limit, page } = paginationDto;

    const [items, total] = await this.businessTypeRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      order: {
        id: 'ASC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getBusinessType(id: string): Promise<BusinessType> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
    });
    if (!businessType) {
      throw new NotFoundException(`BusinessType with ID ${id} not found`);
    }
    return businessType;
  }

  async createBusinessType(
    createBusinessTypeDto: BusinessTypeCreateDto,
  ): Promise<BusinessType> {
    const businessType = this.businessTypeRepository.create({
      ...createBusinessTypeDto,
      id: uuidv4(),
    });

    return await this.businessTypeRepository.save(businessType);
  }

  async updateBusinessType(
    id: string,
    updateDto: BusinessTypeUpdateDto,
  ): Promise<BusinessType> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
    });

    if (!businessType) {
      throw new Error('BusinessType not found');
    }

    // Actualiza las propiedades de businessType con los valores de updateDto
    Object.assign(businessType, updateDto);

    return await this.businessTypeRepository.save(businessType);
  }

  async removeBusinessType(id: string): Promise<void> {
    const businessType = await this.businessTypeRepository.findOne({
      where: { id },
    });

    if (!businessType) {
      throw new Error('BusinessType not found');
    }

    await this.businessTypeRepository.remove(businessType);
  }
}
