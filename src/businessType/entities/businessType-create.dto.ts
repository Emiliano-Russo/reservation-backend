import { IsNotEmpty } from 'class-validator';


export class BusinessTypeCreateDto {
    id?: string;

    @IsNotEmpty()
    name: string;

    description: string;
}