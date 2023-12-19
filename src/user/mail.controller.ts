import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('mail')
export class MailController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Post('send-confirmation')
  async sendConfirmationEmail(@Req() req: Request) {
    console.log('body: ', req.user);
    return this.userService.sendConfirmationEmail(req.user.email);
  }

  @Post('confirm-email')
  confirmEmail(@Query('token') token: string) {
    console.log('confirm email...!');
    return this.userService.confirmEmail(token);
  }
}
