import { IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class BusinessTypeCreateDto {
    @IsString()
    id?: string;


    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}