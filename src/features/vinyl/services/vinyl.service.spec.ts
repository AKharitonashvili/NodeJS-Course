import { Test, TestingModule } from '@nestjs/testing';
import { VinylService } from './vinyl.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vinyl } from '../entities/vinyl.entity';
import { DeleteResult, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { VinylQueryDto } from '../dtos/vinyl-query.dto';
import { CreateVinylDto } from '../dtos/create-vinyl.dto';
import { UpdateVinylDto } from '../dtos/update-vinyl.dto';
import { SortBy } from '../../../common/enums/query.enum';
import {
  authorizedUserVinylQuery,
  createVinyMock,
  vinylMock,
} from '../mocks/vinyl.mocks';

describe('VinylService', () => {
  let service: VinylService;
  let vinylRepository: Repository<Vinyl>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VinylService,
        {
          provide: getRepositoryToken(Vinyl),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<VinylService>(VinylService);
    vinylRepository = module.get<Repository<Vinyl>>(getRepositoryToken(Vinyl));
  });

  it('should find all vinyls with limited reviews', async () => {
    const query: VinylQueryDto = { page: 1, limit: 10 };
    const vinyls = [{ id: 1, reviews: [{ id: 1 }, { id: 2 }] }] as Vinyl[];

    jest.spyOn(vinylRepository, 'find').mockResolvedValue(vinyls);

    const result = await service.findAll(query);
    expect(result[0].reviews.length).toBe(1);
    expect(vinylRepository.find).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      relations: ['reviews'],
    });
  });

  it('should find all vinyls with search and filtered reviews', async () => {
    const query: VinylQueryDto = authorizedUserVinylQuery;
    const vinyls = [
      { ...vinylMock, reviews: [{ id: 1, user: { id: 1 } }] },
    ] as Vinyl[];

    jest.spyOn(vinylRepository, 'find').mockResolvedValue(vinyls);

    const result = await service.findAllWithSearch(query, 2);
    expect(result[0].reviews.length).toBe(1);
    expect(result[0].reviews[0].user.id).not.toBe(2);
    expect(vinylRepository.find).toHaveBeenCalledWith({
      where: { name: expect.any(Object) },
      skip: 0,
      take: 10,
      order: { id: SortBy.ASC },
      relations: ['reviews', 'reviews.user'],
    });
  });

  it('should create a new vinyl', async () => {
    const createVinylDto: CreateVinylDto = createVinyMock;
    const savedVinyl = { id: 1, ...createVinylDto } as Vinyl;

    jest.spyOn(vinylRepository, 'create').mockReturnValue(savedVinyl);
    jest.spyOn(vinylRepository, 'save').mockResolvedValue(savedVinyl);

    const result = await service.create(createVinylDto);
    expect(result).toEqual(savedVinyl);
    expect(vinylRepository.create).toHaveBeenCalledWith(createVinylDto);
    expect(vinylRepository.save).toHaveBeenCalledWith(savedVinyl);
  });

  it('should update an existing vinyl', async () => {
    const updateVinylDto: UpdateVinylDto = { price: 25 };
    const existingVinyl = vinylMock;
    const updatedVinyl = { ...existingVinyl, ...updateVinylDto };

    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(existingVinyl);
    jest.spyOn(vinylRepository, 'save').mockResolvedValue(updatedVinyl);

    const result = await service.update(1, updateVinylDto);
    expect(result).toEqual(updatedVinyl);
    expect(vinylRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(vinylRepository.save).toHaveBeenCalledWith(updatedVinyl);
  });

  it('should throw NotFoundException when updating non-existent vinyl', async () => {
    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(null);

    await expect(service.update(1, { price: 25 })).rejects.toThrow(
      NotFoundException,
    );
    expect(vinylRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should delete a vinyl', async () => {
    const vinyl = vinylMock;

    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(vinyl);
    jest
      .spyOn(vinylRepository, 'delete')
      .mockResolvedValue({ affected: 1 } as DeleteResult);

    const result = await service.delete(1);
    expect(result).toEqual({ message: 'Vinyl was deleted successfully' });
    expect(vinylRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(vinylRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when deleting non-existent vinyl', async () => {
    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(null);

    await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    expect(vinylRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should throw an error if delete fails', async () => {
    const vinyl = vinylMock;

    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(vinyl);
    jest
      .spyOn(vinylRepository, 'delete')
      .mockResolvedValue({ affected: 0 } as DeleteResult);

    await expect(service.delete(1)).rejects.toThrow(
      'Something went wrong. Vinyl was not deleted.',
    );
    expect(vinylRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(vinylRepository.delete).toHaveBeenCalledWith(1);
  });
});
