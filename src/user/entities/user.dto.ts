import { IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserDto {
  id?: string;

  @IsNotEmpty()
  provider: string;

  googleId?: string;

  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string; // Añadido

  @IsNotEmpty()
  civilIdDoc: string; // Añadido

  @IsNotEmpty()
  password: string;

  profileImage?: string;

  bio?: string;

  chats?: string[]; // Añadido
}
