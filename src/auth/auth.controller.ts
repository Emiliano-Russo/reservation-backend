import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('local')
  async login(@Request() req) {
    console.log('la request: ', req.user);
    const { access_token } = await this.authService.login(req.user);
    const user = await this.userService.findOneByEmail(req.user.email);
    return {
      access_token,
      user,
    };
  }

  @Post('google')
  async googleLogin(@Body() body) {
    const { token } = body;

    // Verificar el token con Google y luego crear una sesión de usuario en tu sistema
    const user = await this.authService.verifyGoogleToken(token);

    delete user.password;

    const { access_token } = await this.authService.login(user);
    return {
      access_token,
      user,
    };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Request() req) {
    // Aquí asumimos que 'login' genera un JWT a partir de un objeto de usuario
    const jwt = await this.authService.login(req.user);
    return jwt;
  }
}
