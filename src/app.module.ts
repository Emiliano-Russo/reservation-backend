import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ReservationModule } from './reservation/reservation.module';
import { BusinessModule } from './business/business.module';
import { BusinessTypeModule } from './businessType/businessType.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailController } from './user/mail.controller';

@Module({
  imports: [
    UserModule,
    ReservationModule,
    BusinessModule,
    BusinessTypeModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.SQL_HOST,
      port: 3306,
      username: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Esto sincronizará tu base de datos con tus entidades. Útil en desarrollo, pero ten cuidado en producción.
    }),
  ],
  controllers: [AppController, MailController],
  providers: [AppService],
})
export class AppModule {}
