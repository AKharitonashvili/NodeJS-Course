import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../features/users/entities/user.entity';
import { VinylRepositoryService } from '../vinyl-repository/vinyl-repository.service';

@Injectable()
export class UserRepositoryService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private vinylRepository: VinylRepositoryService,
  ) {}

  async findById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOrCreate(userData: Partial<User>, isAdmin = false): Promise<User> {
    let user = await this.findByEmail(userData.email);

    if (!user) {
      user = this.usersRepository.create({ ...userData, isAdmin });
      await this.usersRepository.save(user);
    }

    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async updateAdminStatus(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    user.isAdmin = !user.isAdmin;
    return this.usersRepository.save(user);
  }

  async findByIdWithRelations(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['reviews', 'purchasedVinyls'],
    });
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async updatePurchasedVinyls(userId: number, vinylId: number, amount: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const vinyl = await this.vinylRepository.findVinylById(vinylId);

    if (!vinyl) {
      throw new NotFoundException('Vinyl not found.');
    }

    let purchasedVinyl = await this.vinylRepository.findPurchasedVinyl(
      userId,
      vinylId,
    );

    if (purchasedVinyl) {
      purchasedVinyl.amount += amount;
      purchasedVinyl.moneySpent =
        purchasedVinyl.vinyl.price * purchasedVinyl.amount;
    } else {
      purchasedVinyl = await this.vinylRepository.createPurchasedVinyl(
        user,
        vinyl,
        amount,
      );
    }

    await this.vinylRepository.savePurchasedVinyl(purchasedVinyl);
  }
}
