import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    console.log('validating user...');
    const user = await this.userService.findOneByEmail(email);
    const res = await bcrypt.compare(password, user.password);

    if (user && user.password && res) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async validateUsername(email: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async login(user: any) {
    console.log('que user me llega?', user);
    const payload = { email: user.email, sub: user.id };
    console.log('tenemos el payload: ', payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyGoogleToken(token: string): Promise<any> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (payload && payload.email_verified) {
      const user = await this.userService.findOneByEmail(payload.email);
      return user;
    }

    throw new UnauthorizedException();
  }
}
