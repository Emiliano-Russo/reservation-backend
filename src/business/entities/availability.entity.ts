import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Business } from './business.entity';
import { Shift } from './shift.entity';

export enum WeekDays {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WeekDays,
  })
  day: WeekDays;

  @OneToMany(() => Shift, (shift) => shift.availability, { cascade: true })
  shifts: Shift[];

  @Column()
  open: boolean;

  @ManyToOne(() => Business, (business) => business.availability)
  business: Business;
}
