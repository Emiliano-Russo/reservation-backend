import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { S3Service } from 'src/shared/s3.service';
import { ReservationModule } from 'src/reservation/reservation.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
@Module({
  imports: [ReservationModule, forwardRef(() => AuthModule), MailModule],
  controllers: [UserController],
  providers: [UserService, S3Service],
  exports: [UserService],
})
export class UserModule {}
