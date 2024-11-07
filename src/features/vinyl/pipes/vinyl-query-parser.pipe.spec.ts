import { VinylQueryParserPipe } from './vinyl-query-parser.pipe';
import { VinylQueryDto } from '../dtos/vinyl-query.dto';
import { SortBy } from '../../../common/enums/query.enum';

describe('VinylQueryParserPipe', () => {
  let pipe: VinylQueryParserPipe;

  beforeEach(() => {
    pipe = new VinylQueryParserPipe();
  });

  it('should return default page and limit values if they are not provided', () => {
    const input = {};
    const result = pipe.transform(input);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(1000);
  });

  it('should parse page and limit correctly if provided', () => {
    const input = { page: '3', limit: '50' };
    const result = pipe.transform(input);

    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it('should set sortBy to "id" if not provided', () => {
    const input = {};
    const result = pipe.transform(input);

    expect(result.sortBy).toBe('id');
  });

  it('should set sortOrder to ASC if not provided or invalid', () => {
    const input = {};
    const result = pipe.transform(input);

    expect(result.sortOrder).toBe(SortBy.ASC);
  });

  it('should set sortOrder to DESC if provided', () => {
    const input = { sortOrder: SortBy.DESC };
    const result = pipe.transform(input);

    expect(result.sortOrder).toBe(SortBy.DESC);
  });

  it('should handle other properties in value object', () => {
    const input = { page: '2', name: 'example', customField: 'test' };
    const result = pipe.transform(input) as any;
    expect(result.page).toBe(2);
    expect(result.name).toBe('example');
    expect(result.customField).toBe(undefined);
  });
});
