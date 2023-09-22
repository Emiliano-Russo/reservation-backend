import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum BusinessStatus {
  Pending = 'Pending',
  Operating = 'Operating',
  Closed = 'Closed',
}

export enum WeekDays {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

@Entity('map')
export class Map {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pointX: string;

  @Column()
  pointY: string;
}

@Entity('shift')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  openingTime: string;

  @Column()
  closingTime: string;
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

  @OneToMany(() => Shift, (shift) => shift.id)
  shifts: Shift[];

  @Column()
  open: boolean;
}

@Entity('business')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  typeId: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column()
  department: string;

  @Column()
  address: string;

  @ManyToOne(() => Map)
  @JoinColumn()
  coordinates: Map;

  @Column({ nullable: true })
  logoURL: string;

  @Column()
  banner: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: BusinessStatus,
  })
  status: BusinessStatus;

  @Column({ default: 0 })
  totalRatingSum: number;

  @Column({ default: 0 })
  totalRatingsCount: number;

  @Column({ default: 0 })
  averageRating: number;

  @OneToMany(() => Availability, (availability) => availability.id)
  availability: Availability[];
}
