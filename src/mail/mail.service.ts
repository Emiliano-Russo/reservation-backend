import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async sendEmail(to: string, subject: string, content: string) {
    await this.mailerService.sendMail({
      to: to,
      subject: subject,
      text: content,
    });
  }

  async sendConfirmationEmail(email: string) {
    const token = this.generateEmailConfirmationToken(email);
    const url = `${process.env.HOST_FRONTEND}/confirm-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirma tu correo',
      text: `Por favor, confirma tu correo haciendo clic en el siguiente enlace: ${url}`,
    });
  }

  private generateEmailConfirmationToken(email: string): string {
    const payload = { email, type: 'email-confirmation' };
    return this.jwtService.sign(payload);
  }

  confirmEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'email-confirmation') {
        throw new Error('Token inválido');
      }

      return { email: payload.email, message: 'Token válido' };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}
