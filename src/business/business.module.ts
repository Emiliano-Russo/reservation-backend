import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { UserModule } from 'src/user/user.module';
import { SharedModule } from 'src/shared/shared.module';
import { Business } from './entities/business.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './entities/availability.entity';
import { Map } from './entities/map.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([Business, Availability, Map, Reservation]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule { }
