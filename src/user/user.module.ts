import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { S3Service } from 'src/shared/s3.service';
import { ReservationModule } from 'src/reservation/reservation.module';
@Module({
    imports: [ReservationModule],
    controllers: [UserController],
    providers: [UserService, S3Service],
    exports: [UserService],
})
export class UserModule { }