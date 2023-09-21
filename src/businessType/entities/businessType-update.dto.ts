import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';

export class BusinessTypeUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
