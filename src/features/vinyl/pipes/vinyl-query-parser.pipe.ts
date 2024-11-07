import { Injectable, PipeTransform } from '@nestjs/common';
import { VinylQueryDto } from '../dtos/vinyl-query.dto';
import { SortBy } from '../../../common/enums/query.enum';

@Injectable()
export class VinylQueryParserPipe implements PipeTransform {
  transform(value: Record<string, any>): VinylQueryDto {
    if (!value) return null;

    const { page, limit, name, authorName, sortBy, sortOrder } = value;

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 1000;

    const parsedSortBy = sortBy || 'id';
    const parsedSortOrder =
      sortOrder?.toUpperCase() === SortBy.DESC ? SortBy.DESC : SortBy.ASC;

    return {
      page: parsedPage,
      limit: parsedLimit,
      name: name || undefined,
      authorName: authorName || undefined,
      sortBy: parsedSortBy,
      sortOrder: parsedSortOrder,
    };
  }
}
