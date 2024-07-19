import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  name!: string

  @Column('text')
  email!: string

  @Column('text', { nullable: true })
  avatarUrl?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('boolean')
  registered!: boolean;
}
