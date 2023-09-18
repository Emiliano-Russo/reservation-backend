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
import { BusinessService } from 'src/business/business.service';
import { RatingDto } from './entities/rating.dto';
import { Business } from 'src/business/entities/business.entity';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(private businessService: BusinessService) {}

  async getReservationByBusinessId(businessId: string) {
    const reservations = await Reservation.scan('businessId')
      .eq(businessId)
      .exec();
    return reservations;
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
      userName: user.name,
      reservationDate: createReservationDto.date
        ? new Date(createReservationDto.date)
        : undefined,
      status: ReservationStatus.Pending,
      extras: createReservationDto.extras,
      rating: 0,
      comment: '',
      negotiable: createReservationDto.negotiable,
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

  async businessProposedSchedule(id: string, date: string) {
    const reservation = await Reservation.get(id);
    console.log('#1');

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status != ReservationStatus.Pending) {
      throw new BadRequestException(
        'This reservation is not longer on Pending State',
      );
    }

    console.log('#2');

    const businessDto = {
      negotiable: {
        dateRange: reservation.negotiable.dateRange,
        timeRange: reservation.negotiable.timeRange,
        businessProposedSchedule: date,
        acceptedBusinessProposed: AcceptStatus.Unanswered,
      },
    };

    console.log('#3', businessDto);

    return Reservation.update(id, businessDto);
  }

  async userResponseProposedSchedule(id: string, value: AcceptStatus) {
    const reservation = await Reservation.get(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status != ReservationStatus.Pending) {
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
      const date = reservation.negotiable.businessProposedSchedule;
      const updateObj = {
        negotiable: undefined,
        reservationDate: new Date(date.toString()),
      };

      return Reservation.update(id, updateObj);
    }

    if (value === AcceptStatus.NotAccepted) {
      const date = reservation.negotiable.businessProposedSchedule;
      const updateObj = {
        negotiable: {
          dateRange: reservation.negotiable.dateRange,
          timeRange: reservation.negotiable.timeRange,
          businessProposedSchedule:
            reservation.negotiable.businessProposedSchedule,
          acceptedBusinessProposed: AcceptStatus.NotAccepted,
        },
      };
      return Reservation.update(id, updateObj);
    }
  }
}
