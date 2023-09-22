import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Availability } from './availability.entity';
import { Map } from './map.entity';

export enum BusinessStatus {
  Pending = 'Pending',
  Operating = 'Operating',
  Closed = 'Closed',
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

  @OneToOne(() => Map, (map) => map.business, { cascade: true })
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

  @OneToMany(() => Availability, (availability) => availability.business, {
    cascade: true,
  })
  availability: Availability[];
}
