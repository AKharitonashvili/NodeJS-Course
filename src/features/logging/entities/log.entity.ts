import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  action!: string;

  @Column()
  entity!: string;

  @Column('text')
  details!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
