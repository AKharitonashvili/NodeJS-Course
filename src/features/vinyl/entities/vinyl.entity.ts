import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { PurchasedVinyl } from './purchased-vinyl.entity';

@Entity()
export class Vinyl {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  authorName!: string;

  @Column()
  description!: string;

  @Column()
  price!: number;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ default: 0 })
  averageScore!: number;

  @OneToMany(() => Review, (review) => review.vinyl)
  reviews!: Review[];

  @OneToMany(() => PurchasedVinyl, (purchasedVinyl) => purchasedVinyl.vinyl)
  purchasedBy!: PurchasedVinyl[];
}
