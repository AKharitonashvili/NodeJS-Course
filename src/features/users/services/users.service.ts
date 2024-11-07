import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepositoryService: UserRepositoryService) {}

  async findById(id: number): Promise<User | undefined> {
    return this.userRepositoryService.findByIdWithRelations(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepositoryService.findByEmail(email);
  }

  async findOrCreate(userData: Partial<User>, isAdmin = false): Promise<User> {
    return this.userRepositoryService.findOrCreate(userData, isAdmin);
  }

  async updateAdminStatus(email: string): Promise<User> {
    return this.userRepositoryService.updateAdminStatus(email);
  }

  async updateProfile(
    id: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userRepositoryService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    return this.userRepositoryService.save(user);
  }

  async deleteById(id: number): Promise<void> {
    const user = await this.userRepositoryService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepositoryService.delete(id);
  }
}
