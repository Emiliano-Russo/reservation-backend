import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Aquí se usa la clave secreta
      signOptions: { expiresIn: '60m' }, // O cualquier otra opción que desees
    }),
    MailerModule.forRoot({
      transport: {
        service: 'SendGrid', // o cualquier otro servicio de correo que estés utilizando
        auth: {
          user: 'apikey', // Esto es literalmente "apikey"
          pass: process.env.SENDGRID_API_KEY, // Deberías usar una variable de entorno aquí
        },
      },
      defaults: {
        from: `"Nombre de remitente" <${process.env.SENDGRID_EMAIL}>`,
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
