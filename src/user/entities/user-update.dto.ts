import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {

    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsBoolean()
    emailVerified: boolean;

    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    civilIdDoc: string;

    profileImage?: string;

    bio?: string;

    password: string;
}