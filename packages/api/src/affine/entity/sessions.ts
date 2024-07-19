import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column('text')
  sessionToken!: string

  @Column('text')
  userId!: string

  @Column('timestamp')
  expires!: Date;
}
