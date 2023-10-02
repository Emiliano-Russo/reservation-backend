import { IsInt, IsOptional, Min } from 'class-validator';

export class LocationDto {
  @IsOptional()
  country?: string = '';

  @IsOptional()
  department?: string = '';
}
