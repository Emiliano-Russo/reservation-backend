import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PaginationParametersDto {
  @IsNumber()
  @IsNotEmpty()
  limit: number;

  @IsOptional()
  lastKey?: { id: string };
}
