import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AcceptStatus,
  Reservation,
  ReservationStatus,
} from './entities/reservation.entity';
import { ReservationCreateDto } from './entities/reservation-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { ReservationUpdateDto } from './entities/reservation-update.dto';
import { NotFoundException } from '@nestjs/common';
import { RatingDto } from './entities/rating.dto';
import {
  PaginatedResponse,
  PaginationDto,
} from 'src/interfaces/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessService } from 'src/business/business.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly businessService: BusinessService,
    private readonly userService: UserService,
  ) {}

  async getReservation(id: string): Promise<Reservation | null> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  async getReservationByBusinessId(
    businessId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse> {
    const { limit, page } = paginationDto;

    const [items, total] = await this.reservationRepository.findAndCount({
      where: { business: { id: businessId } },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        createdAt: 'DESC', // Esto asegura que los resultados estén en orden descendente basados en la fecha de creación
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

  async getReservationsByUserId(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse> {
    const { limit, page } = paginationDto;

    const [items, total] = await this.reservationRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: (page - 1) * limit,
      order: {
        createdAt: 'DESC', // Esto asegura que los resultados estén en orden descendente basados en la fecha de creación
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

  async createReservation(
    createReservationDto: ReservationCreateDto,
  ): Promise<Reservation> {
    const user = await this.userService.getUser(createReservationDto.userId);
    const business = await this.businessService.getBusinessById(
      createReservationDto.businessId,
    );

    if (!user) throw new NotFoundException('User Not Found');
    if (!business) throw new NotFoundException('Business Not Found');

    const reservation = this.reservationRepository.create({
      id: uuidv4(),
      user: user, // Asigna la instancia completa de User
      business: business, // Asigna la instancia completa de Business
      reservationDate: createReservationDto.date
        ? new Date(createReservationDto.date)
        : undefined,
      negotiable: createReservationDto.negotiable,
      status: ReservationStatus.Pending,
      createdAt: new Date(),
    });

    return await this.reservationRepository.save(reservation);
  }

  async updateReservation(
    id: string,
    updateDto: ReservationUpdateDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Actualiza los campos de la reserva con los valores del DTO
    Object.assign(reservation, updateDto);

    return await this.reservationRepository.save(reservation);
  }

  async rateReservation(
    id: string,
    ratingDto: RatingDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    // Carga la relación de negocio si no está cargada
    if (!reservation.business) {
      this.reservationRepository.manager
        .getTreeRepository(Reservation)
        .findAncestorsTree(reservation);
    }

    // Actualiza los campos de calificación y comentario de la reserva
    reservation.rating = ratingDto.rating;
    reservation.comment = ratingDto.comment;

    // Actualiza la información de calificación del negocio
    if (reservation.business) {
      reservation.business.totalRatingsCount += 1;
      reservation.business.totalRatingSum += ratingDto.rating;
      reservation.business.averageRating = Number(
        (
          reservation.business.totalRatingSum /
          reservation.business.totalRatingsCount
        ).toFixed(1),
      );
      this.businessService.updateBusiness(
        reservation.business.id,
        reservation.business,
      );
    }

    return await this.reservationRepository.save(reservation);
  }

  async removeReservation(id: string): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    await this.reservationRepository.remove(reservation);
  }

  async businessProposedSchedule(
    id: string,
    date: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    if (reservation.status !== ReservationStatus.Pending) {
      throw new Error('The reservation is not in a pending state.'); // Puedes personalizar este error según tus necesidades
    }

    // Actualiza los valores en la entidad
    reservation.negotiable.dateRange = { ...reservation.negotiable.dateRange }; // Esto asume que `dateRange` es un objeto
    reservation.negotiable.timeRange = { ...reservation.negotiable.timeRange }; // Esto asume que `timeRange` es un objeto
    reservation.negotiable.businessProposedSchedule = date;
    reservation.negotiable.acceptedBusinessProposed = AcceptStatus.Unanswered;

    return await this.reservationRepository.save(reservation);
  }

  async userResponseProposedSchedule(
    id: string,
    value: AcceptStatus,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== ReservationStatus.Pending) {
      throw new BadRequestException(
        'This reservation is not longer on Pending State',
      );
    }

    if (
      value === AcceptStatus.Unanswered ||
      !reservation.negotiable.dateRange
    ) {
      throw new BadRequestException('Invalid Data');
    }

    if (value === AcceptStatus.Accepted) {
      reservation.reservationDate = new Date(
        reservation.negotiable.businessProposedSchedule,
      );
      reservation.status = ReservationStatus.Confirmed;
      delete reservation.negotiable; // Si deseas eliminar el campo 'negotiable' después de aceptar
    } else if (value === AcceptStatus.NotAccepted) {
      // Si deseas hacer alguna actualización específica cuando no es aceptado, hazlo aquí.
      reservation.negotiable.acceptedBusinessProposed =
        AcceptStatus.NotAccepted;
    }

    return await this.reservationRepository.save(reservation);
  }
}
