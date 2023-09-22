import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Business } from './business.entity';

@Entity('map')
export class Map {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pointX: string;

  @Column()
  pointY: string;

  @OneToOne(() => Business, (business) => business.coordinates)
  business: Business;
}
