import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm/repository/Repository';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) { }

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
}
