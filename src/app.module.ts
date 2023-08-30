import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ReservationModule } from './reservation/reservation.module';
import { BusinessTypeModule } from './businessType/businessType.module';

@Module({
  imports: [UserModule, BusinessTypeModule, ReservationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
