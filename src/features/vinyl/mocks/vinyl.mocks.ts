import { SortBy } from '../../../common/enums/query.enum';
import { CreateVinylDto } from '../dtos/create-vinyl.dto';
import { VinylQueryDto } from '../dtos/vinyl-query.dto';
import { Vinyl } from '../entities/vinyl.entity';

export const getAllVinylsApiQueries = [
  {
    name: 'page',
    required: true,
    description: 'Page number for pagination',
    example: 1,
  },
  {
    name: 'limit',
    required: true,
    description: 'Number of items per page',
    example: 10,
  },
  {
    name: 'name',
    required: false,
    description: 'Name of the vinyl to search for',
  },
  {
    name: 'authorName',
    required: false,
    description: 'Author name of the vinyl to search for',
  },
  {
    name: 'sortBy',
    required: false,
    description: 'Field to sort the vinyl records by',
    example: 'price',
    enum: ['name', 'authorName', 'price'],
  },
  {
    name: 'sortOrder',
    required: false,
    description: 'Sort order, either ASC or DESC',
    example: SortBy.ASC,
    enum: [SortBy.ASC, SortBy.DESC],
  },
];

export const createVinyMock: CreateVinylDto = {
  name: 'Album 1',
  authorName: 'Artist 1',
  description: 'Another hit album',
  price: 1,
  imageUrl: 'https://example.com/album1.jpg',
};

export const vinylQueryMock: VinylQueryDto = { page: 1, limit: 10 };

export const vinylMock: Vinyl = {
  id: 1,
  name: 'Sample',
  reviews: [],
  authorName: 'Author Name',
  description: 'Description',
  price: 10,
  imageUrl: 'https://example.com/vinyl.jpg',
  averageScore: 4,
  purchasedBy: [],
};

export const authorizedUserVinylQuery: VinylQueryDto = {
  page: 1,
  limit: 10,
  name: 'sample',
  sortBy: 'id',
  sortOrder: SortBy.ASC,
};
