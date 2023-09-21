import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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
  civilIdDoc: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: false })
  emailVerified: boolean;

  @UpdateDateColumn({ nullable: true })
  lastLogin: Date;
}
