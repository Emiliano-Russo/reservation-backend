import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ReservationModule } from './reservation/reservation.module';
import { BusinessModule } from './business/business.module';
import { BusinessTypeModule } from './businessType/businessType.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    UserModule,
    ReservationModule,
    BusinessModule,
    BusinessTypeModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
