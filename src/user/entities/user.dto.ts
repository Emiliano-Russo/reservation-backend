import { IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  provider: string;

  @IsOptional()
  googleId?: string;

  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  department: string;

  @IsNotEmpty()
  password: string;

  profileImage?: string;

  bio?: string;

  chats?: string[]; // Añadido
}
