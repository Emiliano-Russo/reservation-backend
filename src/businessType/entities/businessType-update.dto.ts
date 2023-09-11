import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ControlType } from './businessType.entity';

class ControlUpdateDto {
  @IsString()
  @IsOptional()
  type?: ControlType;

  @IsString()
  @IsOptional()
  label?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  options?: string[];

  @IsString()
  @IsOptional()
  default?: string;

  @IsOptional()
  min?: number;

  @IsOptional()
  max?: number;
}

export class BusinessTypeUpdateDto {
  @IsString()
  id: string; // Asumiendo que usas el ID para identificar el recurso a actualizar

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ControlUpdateDto)
  controls?: ControlUpdateDto[];
}
