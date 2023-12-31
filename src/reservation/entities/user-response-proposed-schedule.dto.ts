import { IsEnum } from 'class-validator';
import { AcceptStatus } from './negotiable.entity';

export class UserResponseProposedScheduleDto {
  @IsEnum(AcceptStatus, {
    message:
      'El valor debe ser uno de los siguientes: ' +
      Object.values(AcceptStatus).join(', '),
  })
  value: AcceptStatus;
}
