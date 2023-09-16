import { Module, forwardRef } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { BusinessModule } from 'src/business/business.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [BusinessModule],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService],
})
export class ReservationModule {}
