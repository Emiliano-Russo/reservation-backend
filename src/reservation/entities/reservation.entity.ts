import { Business } from 'src/business/entities/business.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

export enum ReservationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Realized = 'Realized',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected',
  NotAttended = 'NotAttended',
}

export enum AcceptStatus {
  Unanswered = 'Unanswered',
  Accepted = 'Accepted',
  NotAccepted = 'NotAccepted',
}

@Entity('range')
export class Range {
  @Column()
  start: string;

  @Column({ nullable: true })
  end: string;
}

@Entity('negotiable')
export class Negotiable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Range)
  @JoinColumn()
  dateRange: Range;

  @ManyToOne(() => Range)
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
}

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Business)
  @JoinColumn()
  business: Business;

  @Column({ type: 'date', nullable: true })
  reservationDate: Date;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
  })
  status: ReservationStatus;

  @ManyToOne(() => Negotiable)
  @JoinColumn()
  negotiable: Negotiable;

  @CreateDateColumn()
  createdAt: Date;
}
