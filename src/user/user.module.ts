// user.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ReservationModule } from 'src/reservation/reservation.module';
import { MailModule } from 'src/mail/mail.module';
import { UserController } from 'src/user/user.controller';
import { S3Service } from 'src/shared/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService, S3Service],
  exports: [UserService],
})
export class UserModule {}
