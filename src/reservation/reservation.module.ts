import { Module, forwardRef } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { BusinessModule } from 'src/business/business.module';
import { UserModule } from 'src/user/user.module';
import { Reservation } from './entities/reservation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Negotiable } from './entities/negotiable.entity';

@Module({
  imports: [
    BusinessModule,
    UserModule,
    TypeOrmModule.forFeature([Reservation, Negotiable]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
