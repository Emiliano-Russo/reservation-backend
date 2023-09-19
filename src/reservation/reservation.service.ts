import { Injectable } from '@nestjs/common';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReservationCreateDto } from './entities/reservation-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { ReservationUpdateDto } from './entities/reservation-update.dto';
import { NotFoundException } from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';
import { RatingDto } from './entities/rating.dto';
import { Business } from 'src/business/entities/business.entity';
import { PaginatedResponse } from 'src/interfaces/PaginatedResponse';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(private businessService: BusinessService) { }

  async getReservationByBusinessId(businessId: string) {
    const reservations = await Reservation.scan('businessId')
      .eq(businessId)
      .exec();
    return reservations;
  }

  async searchReservationByBusinessName(
    businessName: string,
    limit?: number,
    lastKey?: string
  ): Promise<PaginatedResponse> {
    if (businessName === undefined) {
      throw new Error('businessName cannot be undefined');
    }

    var businessNameInsensitive = businessName.toLocaleLowerCase();

    const params = {
      FilterExpression: 'contains(#businessNameInsensitive, :businessNameInsensitive)',
      ExpressionAttributeNames: { '#businessNameInsensitive': 'businessNameInsensitive' },
      ExpressionAttributeValues: { ':businessNameInsensitive': businessNameInsensitive },
    };

    let reservations = await Reservation.scan(params).limit(limit);

    if (lastKey) {
      reservations = reservations.startAt({ id: lastKey });
    }

    const result = await reservations.exec();
    return {
      items: result,
      lastKey: result.lastKey || null,
    };
  }

  async getReservationsByUserId(userId: string) {
    const reservations = await Reservation.scan('userId').eq(userId).exec();
    return reservations;
  }

  async createReservation(
    createReservationDto: ReservationCreateDto,
  ): Promise<any> {
    const business = await this.businessService.getBusinessById(
      createReservationDto.businessId,
    );
    const user = await User.get(createReservationDto.userId);

    if (business == undefined)
      throw new NotFoundException('Business Not Found');

    const reservation = new Reservation({
      id: uuidv4(),
      userId: createReservationDto.userId,
      businessId: createReservationDto.businessId,
      businessName: business.name,
      businessNameInsensitive: business.name,
      userName: user.name,
      reservationDate: new Date(createReservationDto.date),
      status: createReservationDto.status, // Aquí asumimos que el estado que proviene del DTO ya es válido. Si no es así, se podría validar o configurar un estado predeterminado.
      extras: createReservationDto.extras, // Esto se añade directamente si existe en el DTO. Si no, el valor será undefined, lo cual está permitido por el esquema.
      rating: 0,
      comment: '',
      createdAt: new Date(),
    });

    console.log('Reservation data:', reservation);

    console.log('saving...');
    return await reservation.save();
  }

  async updateReservation(
    id: string,
    updateDto: ReservationUpdateDto,
  ): Promise<any> {
    const reservation = await Reservation.get(id);

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const updateData: any = {};

    if (updateDto.date) {
      updateData.reservationDate = new Date(updateDto.date);
    }

    if (updateDto.status) {
      updateData.status = updateDto.status;
    }

    return Reservation.update(id, updateData);
  }

  async rateReservation(id: string, ratingDto: RatingDto): Promise<any> {
    const reservation = await Reservation.get(id);
    console.log('reservation: ', reservation);
    const business = await Business.get({ id: reservation.businessId });
    business.totalRatingsCount += 1;
    business.totalRatingSum += ratingDto.rating;
    business.averageRating = Number(
      (business.totalRatingSum / business.totalRatingsCount).toFixed(1),
    );

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const updateData: any = {
      rating: ratingDto.rating,
      comment: ratingDto.comment,
    };
    await business.save();
    return Reservation.update(id, updateData);
  }

  async removeReservation(id: string) {
    const reservation = await Reservation.get(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation.delete();
  }
}
