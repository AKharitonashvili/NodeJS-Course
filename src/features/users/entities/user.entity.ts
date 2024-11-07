import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { PurchasedVinyl } from '../../vinyl/entities/purchased-vinyl.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ type: 'date', nullable: true })
  birthDate!: string;

  @Column({ nullable: true })
  avatar!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  @OneToMany(() => Review, (review) => review.user)
  reviews!: Review[];

  @OneToMany(() => PurchasedVinyl, (purchasedVinyl) => purchasedVinyl.user, {
    cascade: true,
  })
  purchasedVinyls!: PurchasedVinyl[];
}
