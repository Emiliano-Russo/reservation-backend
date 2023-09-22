import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Availability } from './availability.entity';

@Entity('shift')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  openingTime: string;

  @Column()
  closingTime: string;

  @ManyToOne(() => Availability, (availability) => availability.shifts)
  availability: Availability;
}
