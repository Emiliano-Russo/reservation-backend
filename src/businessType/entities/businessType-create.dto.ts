import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ControlCreateDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  options?: string[];

  @IsNotEmpty()
  @IsOptional()
  default?: string | number | string[];

  @IsNumber()
  @IsOptional()
  min?: number;

  @IsNumber()
  @IsOptional()
  max?: number;
}

export class BusinessTypeCreateDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ControlCreateDto)
  controls?: ControlCreateDto[];
}
