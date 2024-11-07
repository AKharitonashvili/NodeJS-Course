import { Test, TestingModule } from '@nestjs/testing';
import { VinylController } from './vinyl.controller';
import { VinylService } from '../services/vinyl.service';
import { OptionalJwtAuthGuard } from '../../../common/guards/optional-jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { ValidationPipe, NotFoundException } from '@nestjs/common';
import { VinylQueryDto } from '../dtos/vinyl-query.dto';
import { CreateVinylDto } from '../dtos/create-vinyl.dto';
import { UpdateVinylDto } from '../dtos/update-vinyl.dto';
import { Vinyl } from '../entities/vinyl.entity';
import {
  createVinyMock,
  vinylMock,
  vinylQueryMock,
} from '../mocks/vinyl.mocks';

describe('VinylController', () => {
  let controller: VinylController;
  let vinylService: VinylService;

  const mockVinylService = {
    findAll: jest.fn(),
    findAllWithSearch: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VinylController],
      providers: [
        {
          provide: VinylService,
          useValue: mockVinylService,
        },
      ],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<VinylController>(VinylController);
    vinylService = module.get<VinylService>(VinylService);
  });

  it('should get all vinyl records without userId', async () => {
    const query: VinylQueryDto = vinylQueryMock;
    const vinylRecords = [vinylMock];
    mockVinylService.findAll.mockResolvedValue(vinylRecords);

    const result = await controller.getAllVinyls(null, query);
    expect(result).toEqual(vinylRecords);
    expect(mockVinylService.findAll).toHaveBeenCalledWith(query);
  });

  it('should get all vinyl records with userId', async () => {
    const query: VinylQueryDto = vinylQueryMock;
    const vinylRecords = [vinylMock];
    mockVinylService.findAllWithSearch.mockResolvedValue(vinylRecords);

    const result = await controller.getAllVinyls(1, query);
    expect(result).toEqual(vinylRecords);
    expect(mockVinylService.findAllWithSearch).toHaveBeenCalledWith(query, 1);
  });

  it('should create a vinyl record', async () => {
    const createVinylDto: CreateVinylDto = createVinyMock;
    const vinyl = { id: 1, ...createVinylDto } as Vinyl;
    mockVinylService.create.mockResolvedValue(vinyl);

    const result = await controller.createVinyl(createVinylDto);
    expect(result).toEqual(vinyl);
    expect(mockVinylService.create).toHaveBeenCalledWith(createVinylDto);
  });

  it('should update an existing vinyl record', async () => {
    const updateVinylDto: UpdateVinylDto = { name: 'Updated Vinyl' };
    const vinyl = { id: 1, ...updateVinylDto } as Vinyl;
    mockVinylService.update.mockResolvedValue(vinyl);

    const result = await controller.updateVinyl(1, updateVinylDto);
    expect(result).toEqual(vinyl);
    expect(mockVinylService.update).toHaveBeenCalledWith(1, updateVinylDto);
  });

  it('should throw NotFoundException if vinyl to update is not found', async () => {
    const updateVinylDto: UpdateVinylDto = { name: 'Updated Vinyl' };
    mockVinylService.update.mockRejectedValue(
      new NotFoundException('Vinyl not found'),
    );

    await expect(controller.updateVinyl(1, updateVinylDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a vinyl record', async () => {
    mockVinylService.delete.mockResolvedValue(void 0);

    const result = await controller.deleteVinyl(1);
    expect(result).toEqual({ message: 'Vinyl deleted successfully' });
    expect(mockVinylService.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if vinyl to delete is not found', async () => {
    mockVinylService.delete.mockRejectedValue(
      new NotFoundException('Vinyl not found'),
    );

    await expect(controller.deleteVinyl(1)).rejects.toThrow(NotFoundException);
  });
});
