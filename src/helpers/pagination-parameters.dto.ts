import { IsNotEmpty, IsNumber } from 'class-validator';


export class PaginationParametersDto {
    @IsNumber()
    @IsNotEmpty()
    limit: number;

    @IsNumber()
    lastKey?: { id: string };
}