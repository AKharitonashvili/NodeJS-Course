import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { Vinyl } from '../entities/vinyl.entity';
import { CreateVinylDto } from '../dtos/create-vinyl.dto';
import { VinylQueryDto } from '../dtos/vinyl-query.dto';
import { UpdateVinylDto } from '../dtos/update-vinyl.dto';

@Injectable()
export class VinylService {
  constructor(
    @InjectRepository(Vinyl)
    private readonly vinylRepository: Repository<Vinyl>,
  ) {}

  async findAll(query: VinylQueryDto): Promise<Vinyl[]> {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const vinyls = await this.vinylRepository.find({
      skip: offset,
      take: limit,
      relations: ['reviews'],
    });

    return vinyls.map((vinyl) => {
      vinyl.reviews = vinyl.reviews.slice(0, 1);
      return vinyl;
    });
  }

  async findAllWithSearch(
    query: VinylQueryDto,
    userId: number | null,
  ): Promise<Vinyl[]> {
    const { page, limit, name, authorName, sortBy, sortOrder } = query;
    const offset = (page - 1) * limit;

    let whereCondition: FindOptionsWhere<Vinyl> = {};
    if (name && authorName) {
      whereCondition = {
        name: Like(`%${name}%`),
        authorName: Like(`%${authorName}%`),
      };
    } else if (name) {
      whereCondition = { name: Like(`%${name}%`) };
    } else if (authorName) {
      whereCondition = { authorName: Like(`%${authorName}%`) };
    }

    const orderCondition: FindOptionsOrder<Vinyl> = {};
    if (sortBy) {
      orderCondition[sortBy] = sortOrder;
    }

    const vinyls = await this.vinylRepository.find({
      where: whereCondition,
      skip: offset,
      take: limit,
      order: orderCondition,
      relations: ['reviews', 'reviews.user'],
    });

    return vinyls.map((vinyl) => {
      vinyl.reviews = vinyl.reviews
        .filter((review) => review.user.id !== userId)
        .slice(0, 1);
      return vinyl;
    });
  }

  async create(createVinylDto: CreateVinylDto): Promise<Vinyl> {
    const newVinyl = this.vinylRepository.create(createVinylDto);
    return this.vinylRepository.save(newVinyl);
  }

  async update(id: number, updateVinylDto: UpdateVinylDto): Promise<Vinyl> {
    const vinyl = await this.vinylRepository.findOne({ where: { id } });

    if (!vinyl) {
      throw new NotFoundException(`Vinyl with ID ${id} not found`);
    }

    Object.assign(vinyl, updateVinylDto);
    return this.vinylRepository.save(vinyl);
  }

  async delete(id: number): Promise<{ message: string }> {
    const vinyl = await this.vinylRepository.findOne({ where: { id } });

    if (!vinyl) {
      throw new NotFoundException(`Vinyl with ID ${id} not found`);
    }

    const result = await this.vinylRepository.delete(id);

    if (!result.affected) {
      throw new Error('Something went wrong. Vinyl was not deleted.');
    }

    return { message: 'Vinyl was deleted successfully' };
  }
}
