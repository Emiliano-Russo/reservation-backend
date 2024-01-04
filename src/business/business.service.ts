import { Injectable, NotFoundException } from '@nestjs/common';
import { Business, BusinessStatus } from './entities/business.entity';
import { BusinessCreateDto } from './entities/dto/business-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { BusinessUpdateDto } from './entities/dto/business-update.dto';
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
import { Map } from './entities/map.entity';
import { LocationDto } from './entities/location.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

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
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) { }

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
    locationDto: LocationDto,
  ): Promise<PaginatedResponse> {
    console.log('typeID: ', typeId);
    console.log('pagination: ', paginationDto);
    console.log('search: ', search);
    console.log('location ', locationDto);
    const { limit, page } = paginationDto;

    const whereCondition = { typeId: typeId };

    if (search && search.trim() !== '') {
      whereCondition['name'] = Like(`%${search.trim()}%`);
    }

    // Agregar las condiciones de location si están presentes
    if (locationDto.country) {
      whereCondition['country'] = locationDto.country;
    }
    if (locationDto.department) {
      whereCondition['department'] = locationDto.department;
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
    console.log('\x1b[36m%s\x1b[0m', '############################');
    let coordinates: { id: string; pointX: string; pointY: string } =
      JSON.parse(businessCreateDto.coordinatesStringify);
    let availability: Availability[] = JSON.parse(
      businessCreateDto.availabilityStringify,
    );

    console.log(
      'businessCreateDto ',
      businessCreateDto,
      coordinates,
      availability,
    );

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
    coordinates.id = uuidv4();
    const mapEntity = this.mapRepository.create(coordinates);

    const availabilityEntities = availability.map((avail) => {
      avail.id = uuidv4();
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
      logoURL: logoUrl,
      banner: bannerUrl,
      status: BusinessStatus.Pending,
      totalRatingSum: 0,
      totalRatingsCount: 0,
      averageRating: 0,
      coordinates: mapEntity,
      availability: availabilityEntities,
    });

    return await this.businessRepository.save(business);
  }

  async removeBusiness(id: string) {
    const business = await this.businessRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    // Eliminar todas las referencias en Availability
    await this.availabilityRepository.delete({ business: { id: id } });

    // Eliminar todas las referencias en Reservations
    // Asumiendo que tienes un repository para Reservations similar a availabilityRepository
    await this.reservationRepository.delete({ business: { id: id } });

    // Ahora que todas las referencias han sido eliminadas, puedes eliminar el negocio
    await this.businessRepository.remove(business);
  }
}
