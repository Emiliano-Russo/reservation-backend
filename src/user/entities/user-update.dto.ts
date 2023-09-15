import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {

    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    phone: string;

    @IsNotEmpty()
    civilIdDoc: string;

    profileImage?: string;

    bio?: string;
}