import { Injectable, NotFoundException } from '@nestjs/common';
import { Business, BusinessStatus } from './entities/business.entity';
import { BusinessCreateDto } from './entities/business-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { BusinessUpdateDto } from './entities/business-update.dto';
import { User } from 'src/user/entities/user.entity';
import { BusinessType } from 'src/businessType/entities/businessType.entity';
import { S3Service } from 'src/shared/s3.service';
import {
  PaginatedResponse,
  PaginationDto,
} from 'src/interfaces/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { Shift } from './entities/shift.entity';
import { Map } from './entities/map.entity';

@Injectable()
export class BusinessService {
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    @InjectRepository(Map)
    private readonly mapRepository: Repository<Map>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async getBusinessByOwnerId(
    ownerId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse> {
    const { limit, page } = paginationDto;

    const [items, total] = await this.businessRepository.findAndCount({
      where: { ownerId: ownerId },
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

  async getBusinessByTypeId(
    typeId: string,
    paginationDto: PaginationDto,
    search: string,
  ): Promise<PaginatedResponse> {
    const { limit, page } = paginationDto;

    const whereCondition = { typeId: typeId };

    if (search && search.trim() !== '') {
      whereCondition['name'] = Like(`%${search.trim()}%`);
    }

    const [items, total] = await this.businessRepository.findAndCount({
      where: whereCondition,
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

  async getBusinessById(id: string): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    return business;
  }

  async updateBusiness(
    id: string,
    updateData: BusinessUpdateDto,
    logo?: any,
    banner?: any,
  ): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    console.log('logo: ', logo);

    if (logo) {
      const sanitizedFilename = logo.originalname.replace(/\s+/g, '');
      logo.originalname = sanitizedFilename;
      await this.s3Service.uploadFile(
        logo,
        `business/${business.ownerId}/logo/`,
      );
      business.logoURL = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${business.ownerId}/logo/${sanitizedFilename}`;
    }

    if (banner) {
      const sanitizedBannerFilename = banner.originalname.replace(/\s+/g, '');
      banner.originalname = sanitizedBannerFilename;
      await this.s3Service.uploadFile(
        banner,
        `business/${business.ownerId}/banner/`,
      );
      business.banner = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${business.ownerId}/banner/${sanitizedBannerFilename}`;
    }

    Object.assign(business, updateData);

    await this.businessRepository.save(business);
    return business;
  }

  async createBusiness(
    businessCreateDto: BusinessCreateDto,
    logo: any,
    banner: any,
  ): Promise<any> {
    console.log('\x1b[31m%s\x1b[0m', '############################');
    // Verificar y parsear el campo coordinates si es una cadena de texto
    if (typeof businessCreateDto.coordinates === 'string') {
      businessCreateDto.coordinates = JSON.parse(businessCreateDto.coordinates);
    }

    // Verificar y parsear el campo availability si es una cadena de texto
    if (typeof businessCreateDto.availability === 'string') {
      businessCreateDto.availability = JSON.parse(
        businessCreateDto.availability,
      );
    }

    console.log('businessCreateDto ', businessCreateDto);

    let logoUrl =
      'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000'; // URL por defecto
    let bannerUrl =
      'https://i.pinimg.com/564x/08/8c/09/088c099c81191b734e0db14f0e253142.jpg'; // Puedes poner una URL de imagen de banner por defecto aquí

    if (logo) {
      const sanitizedFilename = logo.originalname.replace(/\s+/g, '');
      logo.originalname = sanitizedFilename;
      await this.s3Service.uploadFile(
        logo,
        `business/${businessCreateDto.ownerId}/logo/`,
      );
      logoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${businessCreateDto.ownerId}/logo/${sanitizedFilename}`;
    }

    if (banner) {
      const sanitizedBannerFilename = banner.originalname.replace(/\s+/g, '');
      banner.originalname = sanitizedBannerFilename;
      await this.s3Service.uploadFile(
        banner,
        `business/${businessCreateDto.ownerId}/banner/`,
      );
      bannerUrl = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/business/${businessCreateDto.ownerId}/banner/${sanitizedBannerFilename}`;
    }

    // Crear y guardar la entidad Map
    const mapEntity = this.mapRepository.create(businessCreateDto.coordinates);

    const availabilityEntities = businessCreateDto.availability.map((avail) => {
      const availabilityEntity = this.availabilityRepository.create(avail);
      // Aquí también deberías manejar la creación de los shifts relacionados
      return availabilityEntity;
    });

    const business = this.businessRepository.create({
      typeId: businessCreateDto.typeId,
      ownerId: businessCreateDto.ownerId,
      name: businessCreateDto.name,
      description: businessCreateDto.description,
      department: businessCreateDto.department,
      country: businessCreateDto.country,
      address: businessCreateDto.address,
      coordinates: mapEntity,
      logoURL: logoUrl,
      banner: bannerUrl,
      status: BusinessStatus.Pending,
      totalRatingSum: 0,
      totalRatingsCount: 0,
      averageRating: 0,
      availability: availabilityEntities,
    });

    return await this.businessRepository.save(business);
  }

  async removeBusiness(id: string) {
    const business = await this.businessRepository.findOne({ where: { id } });

    if (!business) {
      throw new Error('business not found');
    }

    await this.businessRepository.remove(business);
  }
}
