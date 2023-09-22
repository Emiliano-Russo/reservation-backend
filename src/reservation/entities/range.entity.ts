import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Negotiable } from './negotiable.entity';

@Entity('range')
export class Range {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  start: string;

  @Column({ nullable: true })
  end: string;

  @OneToOne(() => Negotiable)
  negotiable: Negotiable;
}
