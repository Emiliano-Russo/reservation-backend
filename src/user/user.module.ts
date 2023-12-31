// user.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from 'src/user/user.controller';
import { S3Service } from 'src/shared/s3.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { MailController } from './mail.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    MailerModule.forRoot({
      transport: {
        service: 'SendGrid', // o cualquier otro servicio de correo que estés utilizando
        auth: {
          user: 'apikey', // Esto es literalmente "apikey"
          pass: process.env.SENDGRID_API_KEY, // Deberías usar una variable de entorno aquí
        },
      },
      defaults: {
        from: `"Agenda Fácil" <${process.env.SENDGRID_EMAIL}>`,
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // en producción, utiliza una variable de entorno para el secreto
      signOptions: { expiresIn: '500m' }, // los tokens expiran después de 1 hora
    }),
  ],
  controllers: [UserController, MailController],
  providers: [UserService, S3Service],
  exports: [UserService],
})
export class UserModule {}
