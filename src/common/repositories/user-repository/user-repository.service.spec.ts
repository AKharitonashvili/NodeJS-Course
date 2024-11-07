import { Test, TestingModule } from '@nestjs/testing';
import { UserRepositoryService } from './user-repository.service';
import { Repository } from 'typeorm';
import { User } from '../../../features/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VinylRepositoryService } from '../vinyl-repository/vinyl-repository.service';
import { NotFoundException } from '@nestjs/common';

describe('UserRepositoryService', () => {
  let service: UserRepositoryService;
  let userRepository: Repository<User>;
  let vinylRepository: VinylRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: VinylRepositoryService,
          useValue: {
            findVinylById: jest.fn(),
            findPurchasedVinyl: jest.fn(),
            createPurchasedVinyl: jest.fn(),
            savePurchasedVinyl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserRepositoryService>(UserRepositoryService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    vinylRepository = module.get<VinylRepositoryService>(
      VinylRepositoryService,
    );
  });

  it('should find a user by ID', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as User;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await service.findById(1);
    expect(result).toEqual(mockUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should find a user by email', async () => {
    const mockUser = { id: 1, email: 'test@example.com' } as User;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await service.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
  });

  it('should find or create a user', async () => {
    const userData = { email: 'test@example.com' };
    const newUser = { ...userData, id: 1, isAdmin: false } as User;
    jest.spyOn(service, 'findByEmail').mockResolvedValue(undefined);
    jest.spyOn(userRepository, 'create').mockReturnValue(newUser);
    jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

    const result = await service.findOrCreate(userData);
    expect(result).toEqual(newUser);
    expect(userRepository.create).toHaveBeenCalledWith({
      ...userData,
      isAdmin: false,
    });
    expect(userRepository.save).toHaveBeenCalledWith(newUser);
  });

  it('should create a new user', async () => {
    const userData = { email: 'newuser@example.com' };
    const newUser = { ...userData, id: 2 } as User;
    jest.spyOn(userRepository, 'create').mockReturnValue(newUser);
    jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

    const result = await service.create(userData);
    expect(result).toEqual(newUser);
    expect(userRepository.create).toHaveBeenCalledWith(userData);
    expect(userRepository.save).toHaveBeenCalledWith(newUser);
  });

  it('should update admin status of a user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      isAdmin: false,
    } as User;
    jest.spyOn(service, 'findByEmail').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'save').mockResolvedValue({
      ...mockUser,
      isAdmin: true,
    });

    const result = await service.updateAdminStatus('test@example.com');
    expect(result.isAdmin).toBe(true);
    expect(userRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      isAdmin: true,
    });
  });

  it('should throw NotFoundException if user is not found when updating admin status', async () => {
    jest.spyOn(service, 'findByEmail').mockResolvedValue(undefined);

    await expect(
      service.updateAdminStatus('nonexistent@example.com'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find a user by ID with relations', async () => {
    const mockUser = { id: 1, reviews: [], purchasedVinyls: [] } as User;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

    const result = await service.findByIdWithRelations(1);
    expect(result).toEqual(mockUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['reviews', 'purchasedVinyls'],
    });
  });

  it('should delete a user by ID', async () => {
    jest
      .spyOn(userRepository, 'delete')
      .mockResolvedValue({ affected: 1 } as any);
    await service.delete(1);
    expect(userRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should update purchased vinyls for a user', async () => {
    const user = { id: 1 } as User;
    const vinyl = { id: 1, price: 20 } as any;
    const purchasedVinyl = { amount: 1, vinyl, moneySpent: 20 } as any;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(vinylRepository, 'findVinylById').mockResolvedValue(vinyl);
    jest
      .spyOn(vinylRepository, 'findPurchasedVinyl')
      .mockResolvedValue(purchasedVinyl);
    jest.spyOn(vinylRepository, 'savePurchasedVinyl').mockResolvedValue(null);

    await service.updatePurchasedVinyls(1, 1, 1);
    expect(purchasedVinyl.amount).toBe(2);
    expect(purchasedVinyl.moneySpent).toBe(40);
    expect(vinylRepository.savePurchasedVinyl).toHaveBeenCalledWith(
      purchasedVinyl,
    );
  });

  it('should create a new purchased vinyl record if none exists', async () => {
    const user = { id: 1 } as User;
    const vinyl = { id: 1, price: 20 } as any;
    const newPurchasedVinyl = { user, vinyl, amount: 1, moneySpent: 20 } as any;

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(vinylRepository, 'findVinylById').mockResolvedValue(vinyl);
    jest
      .spyOn(vinylRepository, 'findPurchasedVinyl')
      .mockResolvedValue(undefined);
    jest
      .spyOn(vinylRepository, 'createPurchasedVinyl')
      .mockResolvedValue(newPurchasedVinyl);
    jest
      .spyOn(vinylRepository, 'savePurchasedVinyl')
      .mockResolvedValue(newPurchasedVinyl);

    await service.updatePurchasedVinyls(1, 1, 1);
    expect(vinylRepository.createPurchasedVinyl).toHaveBeenCalledWith(
      user,
      vinyl,
      1,
    );
    expect(vinylRepository.savePurchasedVinyl).toHaveBeenCalledWith(
      newPurchasedVinyl,
    );
  });

  it('should throw NotFoundException if user is not found when updating purchased vinyls', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

    await expect(service.updatePurchasedVinyls(999, 1, 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if vinyl is not found when updating purchased vinyls', async () => {
    const user = { id: 1 } as User;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    jest.spyOn(vinylRepository, 'findVinylById').mockResolvedValue(undefined);

    await expect(service.updatePurchasedVinyls(1, 999, 1)).rejects.toThrow(
      NotFoundException,
    );
  });
});
