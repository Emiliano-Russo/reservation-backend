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
import { PaginationParametersDto } from 'src/helpers/pagination-parameters.dto';
import { BusinessService } from 'src/business/business.service';
import { RatingDto } from './entities/rating.dto';
import { Business } from 'src/business/entities/business.entity';
import { PaginatedResponse } from 'src/interfaces/PaginatedResponse';
import { User } from 'src/user/entities/user.entity';
import {
  AttributeValue,
  DynamoDB,
  QueryInput,
  UpdateItemInput,
} from '@aws-sdk/client-dynamodb';
import { normalizeDynamoDBData } from '../helpers/normalized.data';

const dynamoDB = new DynamoDB();

interface LastKeyByUserFormat {
  id: string;
  createdAt: string;
  userId: string;
}

interface LastKeyByBusinessFormat {
  businessId: string;
  createdAt: number;
  id: string;
}

@Injectable()
export class ReservationService {
  constructor(private businessService: BusinessService) {}

  async getReservation(id: string, createdAt: number) {
    const params: QueryInput = {
      TableName: 'Reservation',
      KeyConditionExpression: '#id = :idValue AND #createdAt = :createdAtValue',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#createdAt': 'createdAt',
      },
      ExpressionAttributeValues: {
        ':idValue': { S: id },
        ':createdAtValue': { N: createdAt.toString() },
      },
    };

    try {
      const response = await dynamoDB.query(params);
      if (response.Items && response.Items.length > 0) {
        return normalizeDynamoDBData(response.Items[0]); // normaliza el primer elemento
      }
      return null; // no se encontró la reserva
    } catch (error) {
      console.error('Error al consultar DynamoDB:', error);
      throw error;
    }
  }

  async getReservationByBusinessId(
    businessId: string,
    limit: number,
    lastKey: LastKeyByBusinessFormat,
  ): Promise<PaginatedResponse> {
    const params: QueryInput = {
      TableName: 'Reservation', // Asegúrate de que este sea el nombre correcto de tu tabla
      IndexName: 'index-businessId-createdAt',
      KeyConditionExpression: 'businessId = :businessId',
      ExpressionAttributeValues: {
        ':businessId': { S: businessId },
      },
      Limit: limit,
      ScanIndexForward: false, // Esto asegura que los resultados estén en orden descendente basados en la clave de ordenación
    };

    if (lastKey) {
      params.ExclusiveStartKey = {
        businessId: { S: lastKey.businessId },
        createdAt: { N: String(lastKey.createdAt) },
        id: { S: lastKey.id },
      };
    }

    try {
      const result = await dynamoDB.query(params);
      console.log('About to normalize....');
      const normalizedItems = result.Items.map((item) =>
        normalizeDynamoDBData(item),
      );
      console.log('WE MADE IT!!');
      return {
        items: normalizedItems,
        lastKey: normalizeDynamoDBData(result.LastEvaluatedKey) || null,
      };
    } catch (error) {
      console.error('Error al consultar DynamoDB:', error);
      throw error;
    }
  }

  async getReservationsByUserId(
    userId: string,
    limit: number,
    lastKey: LastKeyByUserFormat,
  ): Promise<PaginatedResponse> {
    const params: QueryInput = {
      TableName: 'Reservation', // Reemplaza con el nombre real de tu tabla
      IndexName: 'index-userId-createdAt',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': { S: userId },
      },
      Limit: limit,
      ScanIndexForward: false, // Esto asegura que los resultados estén en orden descendente basados en la clave de ordenación
    };

    if (lastKey) {
      params.ExclusiveStartKey = {
        userId: { S: lastKey.userId },
        createdAt: { N: String(lastKey.createdAt) },
        id: { S: lastKey.id },
      };
    }
    try {
      const result = await dynamoDB.query(params);
      const normalizedItems = result.Items.map((item) =>
        normalizeDynamoDBData(item),
      );
      return {
        items: normalizedItems,
        lastKey: normalizeDynamoDBData(result.LastEvaluatedKey) || null,
      };
    } catch (error) {
      console.error('Error al consultar DynamoDB:', error);
      throw error;
    }
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

    return await reservation.save();
  }

  async updateReservation(
    id: string,
    createdAt: number,
    updateDto: ReservationUpdateDto,
  ): Promise<any> {
    const params: UpdateItemInput = {
      TableName: 'Reservation', // Cambia esto por el nombre real de tu tabla
      Key: {
        id: { S: id },
        createdAt: { N: createdAt.toString() },
      },
      UpdateExpression: 'SET #status = :statusValue', // Esto es un ejemplo, ajusta según tus necesidades
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':statusValue': { S: updateDto.status },
      },
      ConditionExpression:
        'attribute_exists(id) AND attribute_exists(createdAt)',
      ReturnValues: 'ALL_NEW', // Esto retornará el elemento actualizado
    };

    try {
      const response = await dynamoDB.updateItem(params);
      return normalizeDynamoDBData(response.Attributes); // Esto retornará los atributos del elemento actualizado
    } catch (error) {
      console.error('Error al actualizar en DynamoDB:', error);
      throw error;
    }
  }

  async rateReservation(id: string, ratingDto: RatingDto): Promise<any> {
    const reservation = await Reservation.get(id);
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

  async businessProposedSchedule(id: string, createdAt: number, date: string) {
    console.log('proposed schedule....');
    const reservation = await this.getReservation(id, createdAt);

    const params: UpdateItemInput = {
      TableName: 'Reservation',
      Key: {
        id: { S: id },
        createdAt: { N: createdAt.toString() },
      },
      UpdateExpression:
        'SET negotiable.dateRange = :dateRangeValue, negotiable.timeRange = :timeRangeValue, negotiable.businessProposedSchedule = :businessProposedScheduleValue, negotiable.acceptedBusinessProposed = :acceptedBusinessProposedValue',
      ExpressionAttributeValues: {
        ':dateRangeValue': {
          M: {
            start: { S: reservation.negotiable.dateRange.start },
            end: { S: reservation.negotiable.dateRange.end },
          },
        },
        ':timeRangeValue': {
          M: {
            start: { S: reservation.negotiable.timeRange.start },
            end: { S: reservation.negotiable.timeRange.end },
          },
        },
        ':businessProposedScheduleValue': { S: date },
        ':acceptedBusinessProposedValue': { S: AcceptStatus.Unanswered },
        ':pendingStatus': { S: ReservationStatus.Pending },
      },
      ConditionExpression:
        'attribute_exists(id) AND attribute_exists(createdAt) AND #status = :pendingStatus',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const response = await dynamoDB.updateItem(params);
      return normalizeDynamoDBData(response.Attributes); // Esto retornará los atributos del elemento actualizado
    } catch (error) {
      console.error('Error al actualizar en DynamoDB:', error);
      throw error;
    }
  }

  async userResponseProposedSchedule(
    id: string,
    createdAt: number,
    value: AcceptStatus,
  ) {
    const reservation = await this.getReservation(id, createdAt);

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

    let UpdateExpression = '';
    const ExpressionAttributeValues: Record<string, AttributeValue> = {};

    if (value === AcceptStatus.Accepted) {
      UpdateExpression =
        'REMOVE negotiable SET reservationDate = :reservationDateValue, #status = :confirmedStatus';
      ExpressionAttributeValues[':reservationDateValue'] = {
        S: reservation.negotiable.businessProposedSchedule,
      };
      ExpressionAttributeValues[':confirmedStatus'] = {
        S: ReservationStatus.Confirmed,
      };
    } else if (value === AcceptStatus.NotAccepted) {
      UpdateExpression =
        'SET negotiable.dateRange = :dateRangeValue, negotiable.timeRange = :timeRangeValue, negotiable.businessProposedSchedule = :businessProposedScheduleValue, negotiable.acceptedBusinessProposed = :notAcceptedStatus';
      ExpressionAttributeValues[':dateRangeValue'] = {
        M: {
          start: { S: reservation.negotiable.dateRange.start },
          end: { S: reservation.negotiable.dateRange.end },
        },
      };
      ExpressionAttributeValues[':timeRangeValue'] = {
        M: {
          start: { S: reservation.negotiable.timeRange.start },
          end: { S: reservation.negotiable.timeRange.end },
        },
      };
      ExpressionAttributeValues[':businessProposedScheduleValue'] = {
        S: reservation.negotiable.businessProposedSchedule,
      };
      ExpressionAttributeValues[':notAcceptedStatus'] = {
        S: AcceptStatus.NotAccepted,
      };
    }

    if (!UpdateExpression) {
      throw new Error('UpdateExpression is empty. This should not happen.');
    }

    ExpressionAttributeValues[':pendingStatus'] = {
      S: ReservationStatus.Pending,
    };

    const params: UpdateItemInput = {
      TableName: 'Reservation',
      Key: {
        id: { S: id },
        createdAt: { N: createdAt.toString() },
      },
      UpdateExpression: UpdateExpression,
      ExpressionAttributeValues: ExpressionAttributeValues,
      ConditionExpression:
        'attribute_exists(id) AND attribute_exists(createdAt) AND #status = :pendingStatus',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ReturnValues: 'ALL_NEW',
    };

    try {
      const response = await dynamoDB.updateItem(params);
      return normalizeDynamoDBData(response.Attributes);
    } catch (error) {
      console.error('Error al actualizar en DynamoDB:', error);
      throw error;
    }
  }
}
