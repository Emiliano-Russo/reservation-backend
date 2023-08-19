import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  id?: string;

  @IsNotEmpty()
  provider: string;

  googleId?: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  profileImage?: string;

  bio?: string;

  emailVerified: any;

  isPrivate: any;
}