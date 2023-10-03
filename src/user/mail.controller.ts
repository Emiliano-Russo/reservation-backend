import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('mail')
export class MailController {
  constructor(private readonly userService: UserService) {}

  @Post('send-confirmation')
  async sendConfirmationEmail(@Body() body: { email: string }) {
    console.log('body: ', body);
    return this.userService.sendConfirmationEmail(body.email);
  }

  @Post('confirm-email')
  confirmEmail(@Query('token') token: string) {
    console.log('confirm email...!');
    return this.userService.confirmEmail(token);
  }
}
