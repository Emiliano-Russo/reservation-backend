import { IsInt, IsOptional, Min } from 'class-validator';
import { ObjectType } from 'dynamoose/dist/General';

export interface PaginatedResponse {
  items: any;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;
}
