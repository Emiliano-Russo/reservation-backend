import { Business } from 'src/business/entities/business.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Negotiable } from './negotiable.entity';

export enum ReservationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Realized = 'Realized',
  Cancelled = 'Cancelled',
  Rejected = 'Rejected',
  NotAttended = 'NotAttended',
}

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.reservations, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Business, (business) => business.reservations, {
    eager: true,
  })
  @JoinColumn()
  business: Business;

  @Column({ type: 'timestamp', nullable: true })
  reservationDate: Date | null;

  @Column({ nullable: true })
  bookingInstructions: string;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
  })
  status: ReservationStatus;

  @OneToOne(() => Negotiable, (negotiable) => negotiable.reservation, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  negotiable: Negotiable | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;
}
