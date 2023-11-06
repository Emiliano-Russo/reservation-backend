import { BadRequestException, Injectable } from '@nestjs/common';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
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
import { IsNull, Like, Not, Repository } from 'typeorm';
import { BusinessService } from 'src/business/business.service';
import { UserService } from 'src/user/user.service';
import { AcceptStatus, Negotiable } from './entities/negotiable.entity';
import { FirebaseService } from 'src/shared/firebase.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Negotiable)
    private readonly negotiableRepository: Repository<Negotiable>,
    private readonly businessService: BusinessService,
    private readonly userService: UserService,
    private readonly firebaseService: FirebaseService,
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
    search: string = '',
    startDate?: string,
    endDate?: string,
    status?: ReservationStatus,
  ): Promise<PaginatedResponse> {
    return this.getReservationsWithFilters(
      { businessId },
      paginationDto,
      search,
      startDate,
      endDate,
      status,
    );
  }

  async getReservationsByUserId(
    userId: string,
    paginationDto: PaginationDto,
    search: string = '',
    startDate?: string,
    endDate?: string,
    status?: ReservationStatus,
  ): Promise<PaginatedResponse> {
    return this.getReservationsWithFilters(
      { userId },
      paginationDto,
      search,
      startDate,
      endDate,
      status,
    );
  }

  async getLastReservationByBusinessId(
    businessId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: {
        business: { id: businessId },
        rating: Not(IsNull()), // Asegura que el rating no sea null
      },
      order: { createdAt: 'DESC' }, // Ordena por fecha de creación en orden descendente
      relations: ['user', 'business', 'negotiable'],
    });

    if (!reservation) {
      throw new NotFoundException(
        `No reservations with reviews found for business with ID ${businessId}`,
      );
    }

    return reservation;
  }

  private async getReservationsWithFilters(
    filter: { userId?: string; businessId?: string },
    paginationDto: PaginationDto,
    search: string = '',
    startDate?: string,
    endDate?: string,
    status?: ReservationStatus,
  ): Promise<PaginatedResponse> {
    const { limit, page } = paginationDto;

    const queryBuilder =
      this.reservationRepository.createQueryBuilder('reservation');

    // JOIN con Negotiable
    queryBuilder.leftJoinAndSelect('reservation.negotiable', 'negotiable');
    queryBuilder.leftJoinAndSelect('negotiable.dateRange', 'dateRange');
    queryBuilder.leftJoinAndSelect('negotiable.timeRange', 'timeRange');

    if (filter.userId) {
      queryBuilder.leftJoinAndSelect('reservation.business', 'business');
      queryBuilder.where('reservation.user.id = :userId', {
        userId: filter.userId,
      });
      if (search && search.trim() !== '') {
        queryBuilder.andWhere('business.name LIKE :search', {
          search: `%${search.trim()}%`,
        });
      }
    } else if (filter.businessId) {
      queryBuilder.leftJoinAndSelect('reservation.user', 'user');
      queryBuilder.where('reservation.business.id = :businessId', {
        businessId: filter.businessId,
      });
      if (search && search.trim() !== '') {
        queryBuilder.andWhere('user.name LIKE :search', {
          search: `%${search.trim()}%`,
        });
      }
    }

    queryBuilder
      .take(limit)
      .skip((page - 1) * limit)
      .orderBy('reservation.createdAt', 'DESC');

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'reservation.reservationDate BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      );
    }

    if (status) {
      queryBuilder.andWhere('reservation.status = :status', { status });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
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
      bookingInstructions: createReservationDto.bookingInstructions,
      status: ReservationStatus.Pending,
      createdAt: new Date(),
    });

    this.userService.addLoyaltyPoints(user.id, 10);
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

    if (updateDto.status) {
      if (updateDto.status == ReservationStatus.Cancelled) {
        const userOwner = await this.userService.getUser(
          reservation.business.ownerId,
        );
        await this.sendStatusChangeNotification(
          reservation.status,
          updateDto.status,
          userOwner.fcmToken,
        );
      } else {
        await this.sendStatusChangeNotification(
          reservation.status,
          updateDto.status,
          reservation.user.fcmToken,
        );
      }
    }

    if (
      updateDto.status !== undefined &&
      updateDto.status === ReservationStatus.Rejected
    ) {
      reservation.negotiable = null; // o `delete reservation.negotiable;` si realmente quieres eliminar la propiedad
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
      relations: ['business', 'user'],
    });

    console.log('reservation: ', reservation);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
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

    console.log('final reservation... ', reservation);

    this.userService.addLoyaltyPoints(reservation.user.id, 5);

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

    console.log('--- ', id, date);
    console.log('--- reservation: ', reservation);

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    if (reservation.status !== ReservationStatus.Pending) {
      throw new Error('The reservation is not in a pending state.'); // Puedes personalizar este error según tus necesidades
    }

    // Actualiza los valores en la entidad
    // reservation.negotiable.dateRange = { ...reservation.negotiable.dateRange }; // Esto asume que `dateRange` es un objeto
    // reservation.negotiable.timeRange = { ...reservation.negotiable.timeRange }; // Esto asume que `timeRange` es un objeto
    reservation.negotiable.businessProposedSchedule = date;
    reservation.negotiable.acceptedBusinessProposed = AcceptStatus.Unanswered;
    this.firebaseService.sendNotification(
      reservation.user.fcmToken,
      '¡Nueva Propuesta de Fecha!',
      'El negocio ha propuesto una nueva fecha para tu reserva. ¡Revisa y confirma!',
    );

    return await this.reservationRepository.save(reservation);
  }

  async userResponseProposedSchedule(
    id: string,
    value: AcceptStatus,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    console.log('reservation: ', reservation);

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
    const userOwner = await this.userService.getUser(
      reservation.business.ownerId,
    );
    if (value === AcceptStatus.Accepted) {
      this.firebaseService.sendNotification(
        userOwner.id,
        'Propuesta Aceptada',
        `Tu propuesta de fecha ha sido aceptada por ${reservation.user.name}`,
      );
      reservation.reservationDate = new Date(
        reservation.negotiable.businessProposedSchedule,
      );
      reservation.status = ReservationStatus.Confirmed;

      // Guarda el ID del negotiable para eliminarlo después
      const negotiableId = reservation.negotiable.id;
      reservation.negotiable = null;

      // Guarda la reserva con el negotiable en null
      await this.reservationRepository.save(reservation);

      // Elimina el registro negotiable de la base de datos
      await this.negotiableRepository.delete(negotiableId);
    } else if (value === AcceptStatus.NotAccepted) {
      this.firebaseService.sendNotification(
        userOwner.id,
        'Propuesta Rechazada',
        `${reservation.user.name} no ha aceptado la fecha propuesta. Considera proponer una nueva fecha.`,
      );
      // Si deseas hacer alguna actualización específica cuando no es aceptado, hazlo aquí.
      reservation.negotiable.acceptedBusinessProposed =
        AcceptStatus.NotAccepted;
      return await this.reservationRepository.save(reservation);
    }
  }

  private async sendStatusChangeNotification(
    previousStatus: ReservationStatus,
    newStatus: ReservationStatus,
    userToken: string,
  ) {
    if (previousStatus === newStatus) {
      return; // No hay cambio de estado, no hacer nada
    }

    let title = 'Estado de Reserva Actualizado';
    let message = `El estado de tu reserva ha sido actualizado a ${newStatus}.`;

    switch (newStatus) {
      case ReservationStatus.Rejected:
        title = 'Reserva Rechazada';
        message =
          'Lamentamos informarte que tu reserva ha sido rechazada por el negocio.';
        break;
      case ReservationStatus.Confirmed:
        title = 'Reserva Confirmada';
        message = '¡Buenas noticias! Tu reserva ha sido confirmada.';
        break;
      case ReservationStatus.Realized:
        title = 'Reserva Realizada';
        message = 'Tu reserva ha sido realizada con éxito.';
        break;
      case ReservationStatus.Cancelled:
        title = 'Reserva Cancelada';
        message = 'La reserva ha sido cancelada.';
        break;
      case ReservationStatus.NotAttended:
        title = 'No Asististe';
        message = 'No asististe a tu reserva.';
        break;
    }

    await this.firebaseService.sendNotification(userToken, title, message);
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const reservations = await this.reservationRepository.find({
      where: { user: { id: userId } },
    });
    console.log('reservations: ', reservations);

    for (const reservation of reservations) {
      await this.reservationRepository.remove(reservation);
    }

    this.userService.deleteUser(userId);

    return {
      message: 'User and all related reservations deleted successfully',
    };
  }
}
