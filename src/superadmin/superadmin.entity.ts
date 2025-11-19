import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gender } from './superadmin.dto';

@Entity('superadmins')
export class SuperAdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column()
  phone: string;

  @Column()
  role: string;

  @Column({ type: 'enum', enum: Gender })
  gender: string;

  @Column()
  nidNumber: string;

  @Column({ nullable: true })
  nidImageUrl: string;

  @Column({ default: 'active' })
  status: string;

  @Column('text', { array: true, nullable: true })
  permissions: string[];

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
