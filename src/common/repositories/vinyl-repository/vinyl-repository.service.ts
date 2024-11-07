import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { PurchasedVinyl } from '../../../features/vinyl/entities/purchased-vinyl.entity';
import { User } from '../../../features/users/entities/user.entity';
import { Vinyl } from '../../../features/vinyl/entities/vinyl.entity';

@Injectable()
export class VinylRepositoryService {
  constructor(
    @InjectRepository(PurchasedVinyl)
    private purchasedVinylRepository: Repository<PurchasedVinyl>,
    @InjectRepository(Vinyl)
    private vinylRepository: Repository<Vinyl>,
  ) {}

  async findVinylById(vinylId: number): Promise<Vinyl> {
    return this.vinylRepository.findOne({
      where: {
        id: vinylId,
      },
    });
  }

  async findPurchasedVinyl(
    userId: number,
    vinylId: number,
  ): Promise<PurchasedVinyl> {
    return this.purchasedVinylRepository.findOne({
      where: {
        user: { id: userId },
        vinyl: { id: vinylId },
      },
      relations: ['vinyl', 'user'],
    });
  }

  async createPurchasedVinyl(
    user: User,
    vinyl: Vinyl,
    amount: number,
  ): Promise<PurchasedVinyl> {
    const newPurchasedVinyl = this.purchasedVinylRepository.create({
      user,
      vinylId: vinyl.id,
      amount,
      moneySpent: vinyl.price * amount,
    });

    return this.purchasedVinylRepository.save(newPurchasedVinyl);
  }

  savePurchasedVinyl(purchasedVinyl: PurchasedVinyl): Promise<PurchasedVinyl> {
    return this.purchasedVinylRepository.save(purchasedVinyl);
  }

  async updateVinyl(
    vinylId: number,
    averageRating: number,
  ): Promise<UpdateResult> {
    return this.vinylRepository.update(vinylId, {
      averageScore: averageRating,
    });
  }

  async findOne(vinylId: number): Promise<Vinyl> {
    return await this.vinylRepository.findOne({
      where: { id: vinylId },
      relations: ['reviews'],
    });
  }
}
