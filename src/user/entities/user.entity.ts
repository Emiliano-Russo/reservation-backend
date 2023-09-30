import { Reservation } from 'src/reservation/entities/reservation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  googleId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  country: string;

  @Column()
  department: string;

  @Column()
  civilIdDoc: string;

  @Column()
  password: string;

  @Column()
  loyaltyPoints: number;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: false })
  emailVerified: boolean;

  @UpdateDateColumn({ nullable: true })
  lastLogin: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
