import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vinyl } from '../../vinyl/entities/vinyl.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  rating!: number;

  @Column()
  comment!: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Vinyl, (vinyl) => vinyl.reviews, { onDelete: 'CASCADE' })
  vinyl!: Vinyl;
}
