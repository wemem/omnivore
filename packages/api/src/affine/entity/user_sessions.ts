import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class UserSessions {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  sessionId!: string

  @Column('text')
  userId!: string

  @Column('timestamp', { nullable: true })
  expiresAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
