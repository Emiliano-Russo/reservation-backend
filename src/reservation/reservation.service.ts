import { Injectable } from '@nestjs/common';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReservationCreateDto } from './entities/reservation-create.dto';
import { v4 as uuidv4 } from 'uuid';
import { ReservationUpdateDto } from './entities/reservation-update.dto';
import { NotFoundException } from '@nestjs/common';
import { BusinessService } from 'src/business/business.service';

@Injectable()
export class ReservationService {
  constructor(private businessService: BusinessService) {}

  async getReservationByBusinessId(businessId: string) {
    const reservations = await Reservation.scan('businessId')
      .eq(businessId)
      .exec();
    return reservations;
  }

  async createReservation(
    createReservationDto: ReservationCreateDto,
  ): Promise<any> {
    const business = await this.businessService.getBusinessById(
      createReservationDto.id,
    );

    if (business == undefined)
      throw new NotFoundException('Business Not Found');

    const reservation = new Reservation({
      id: uuidv4(),
      userId: createReservationDto.userId,
      businessId: createReservationDto.businessId,
      businessName: business.name,
      reservationDate: new Date(createReservationDto.reservationDate),
      status: createReservationDto.status, // Aquí asumimos que el estado que proviene del DTO ya es válido. Si no es así, se podría validar o configurar un estado predeterminado.
      extras: createReservationDto.extras, // Esto se añade directamente si existe en el DTO. Si no, el valor será undefined, lo cual está permitido por el esquema.
      createdAt: new Date(),
    });

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

  async removeReservation(id: string) {
    const reservation = await Reservation.get(id);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation.delete();
  }
}
