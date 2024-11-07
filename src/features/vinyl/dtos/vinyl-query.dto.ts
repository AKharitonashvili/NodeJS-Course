import { IsNumber, IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { SortBy } from '../../../common/enums/query.enum';

export class VinylQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit: number = 10;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'authorName', 'price'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn([SortBy.ASC, SortBy.DESC])
  sortOrder?: SortBy.ASC | SortBy.DESC = SortBy.ASC;
}
