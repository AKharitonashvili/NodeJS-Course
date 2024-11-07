import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { VinylRepositoryService } from './vinyl-repository.service';
import { PurchasedVinyl } from '../../../features/vinyl/entities/purchased-vinyl.entity';
import { User } from '../../../features/users/entities/user.entity';
import { Vinyl } from '../../../features/vinyl/entities/vinyl.entity';

describe('VinylRepositoryService', () => {
  let service: VinylRepositoryService;
  let purchasedVinylRepository: Repository<PurchasedVinyl>;
  let vinylRepository: Repository<Vinyl>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VinylRepositoryService,
        {
          provide: getRepositoryToken(PurchasedVinyl),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Vinyl),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<VinylRepositoryService>(VinylRepositoryService);
    purchasedVinylRepository = module.get<Repository<PurchasedVinyl>>(
      getRepositoryToken(PurchasedVinyl),
    );
    vinylRepository = module.get<Repository<Vinyl>>(getRepositoryToken(Vinyl));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find vinyl by ID', async () => {
    const vinylId = 1;
    const vinyl = { id: vinylId } as Vinyl;
    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(vinyl);

    const result = await service.findVinylById(vinylId);
    expect(result).toEqual(vinyl);
    expect(vinylRepository.findOne).toHaveBeenCalledWith({
      where: { id: vinylId },
    });
  });

  it('should find purchased vinyl by user and vinyl ID', async () => {
    const userId = 1;
    const vinylId = 2;
    const purchasedVinyl = {
      user: { id: userId },
      vinyl: { id: vinylId },
    } as PurchasedVinyl;
    jest
      .spyOn(purchasedVinylRepository, 'findOne')
      .mockResolvedValue(purchasedVinyl);

    const result = await service.findPurchasedVinyl(userId, vinylId);
    expect(result).toEqual(purchasedVinyl);
    expect(purchasedVinylRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: userId }, vinyl: { id: vinylId } },
      relations: ['vinyl', 'user'],
    });
  });

  it('should create a new purchased vinyl', async () => {
    const user = { id: 1 } as User;
    const vinyl = { id: 2, price: 20 } as Vinyl;
    const amount = 2;
    const newPurchasedVinyl = {
      user,
      vinylId: vinyl.id,
      amount,
      moneySpent: vinyl.price * amount,
    } as PurchasedVinyl;

    jest
      .spyOn(purchasedVinylRepository, 'create')
      .mockReturnValue(newPurchasedVinyl);
    jest
      .spyOn(purchasedVinylRepository, 'save')
      .mockResolvedValue(newPurchasedVinyl);

    const result = await service.createPurchasedVinyl(user, vinyl, amount);
    expect(result).toEqual(newPurchasedVinyl);
    expect(purchasedVinylRepository.create).toHaveBeenCalledWith({
      user,
      vinylId: vinyl.id,
      amount,
      moneySpent: vinyl.price * amount,
    });
    expect(purchasedVinylRepository.save).toHaveBeenCalledWith(
      newPurchasedVinyl,
    );
  });

  it('should save a purchased vinyl', async () => {
    const purchasedVinyl = {
      vinylId: 1,
      amount: 2,
      vinyl: {},
    } as PurchasedVinyl;
    jest
      .spyOn(purchasedVinylRepository, 'save')
      .mockResolvedValue(purchasedVinyl);

    const result = await service.savePurchasedVinyl(purchasedVinyl);
    expect(result).toEqual(purchasedVinyl);
    expect(purchasedVinylRepository.save).toHaveBeenCalledWith(purchasedVinyl);
  });

  it('should update vinyl average rating', async () => {
    const vinylId = 1;
    const averageRating = 4.5;
    const updateResult = { affected: 1 } as UpdateResult;
    jest.spyOn(vinylRepository, 'update').mockResolvedValue(updateResult);

    const result = await service.updateVinyl(vinylId, averageRating);
    expect(result).toEqual(updateResult);
    expect(vinylRepository.update).toHaveBeenCalledWith(vinylId, {
      averageScore: averageRating,
    });
  });

  it('should find vinyl by ID with reviews relation', async () => {
    const vinylId = 1;
    const vinyl = { id: vinylId, reviews: [] } as Vinyl;
    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(vinyl);

    const result = await service.findOne(vinylId);
    expect(result).toEqual(vinyl);
    expect(vinylRepository.findOne).toHaveBeenCalledWith({
      where: { id: vinylId },
      relations: ['reviews'],
    });
  });
});
