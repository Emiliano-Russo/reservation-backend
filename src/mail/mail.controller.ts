import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) { }

  @Post('send-confirmation')
  async sendConfirmationEmail(@Body('email') email: string) {
    return this.mailService.sendConfirmationEmail(email);
  }
}
