import { IsString, IsNotEmpty } from 'class-validator';

export class ScheduleProposedDto {
  @IsString()
  @IsNotEmpty()
  date: string;
}
