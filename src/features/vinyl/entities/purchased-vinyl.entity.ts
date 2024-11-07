import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vinyl } from './vinyl.entity';

@Entity()
export class PurchasedVinyl {
  @PrimaryColumn()
  vinylId!: number;

  @ManyToOne(() => Vinyl, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'vinylId' })
  vinyl!: Vinyl;

  @ManyToOne(() => User, (user) => user.purchasedVinyls, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column()
  amount!: number;

  @Column()
  moneySpent!: number;
}
