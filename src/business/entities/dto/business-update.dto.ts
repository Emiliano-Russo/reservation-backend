// business-update.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { BusinessCreateDto } from './business-create.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class BusinessUpdateDto extends PartialType(BusinessCreateDto) {
  @IsString()
  @IsNotEmpty()
  id: string;

  logo?: any; // Representa la imagen del logo
  banner?: any; // Representa la imagen del banner
}
