import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Range } from './range.entity';

export enum AcceptStatus {
  Unanswered = 'Unanswered',
  Accepted = 'Accepted',
  NotAccepted = 'NotAccepted',
}

@Entity('negotiable')
export class Negotiable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Range, (range) => range.negotiable, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  dateRange: Range;

  @OneToOne(() => Range, (range) => range.negotiable, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  timeRange: Range;

  @Column({ nullable: true })
  businessProposedSchedule: string;

  @Column({
    type: 'enum',
    enum: AcceptStatus,
    nullable: true,
  })
  acceptedBusinessProposed: AcceptStatus;

  @OneToOne(() => Reservation, (reservation) => reservation.negotiable)
  reservation: Reservation;
}
