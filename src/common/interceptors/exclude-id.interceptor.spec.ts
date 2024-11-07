import { ExcludeIdInterceptor } from './exclude-id.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { Test } from '@nestjs/testing';

describe('ExcludeIdInterceptor', () => {
  let interceptor: ExcludeIdInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ExcludeIdInterceptor],
    }).compile();

    interceptor = module.get<ExcludeIdInterceptor<any>>(ExcludeIdInterceptor);
    mockExecutionContext = {} as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    };
  });

  it('should exclude "id" from a single object', (done) => {
    const data = { id: 1, name: 'Test', description: 'Single object' };
    mockCallHandler.handle = jest.fn(() => of(data));

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toEqual({ name: 'Test', description: 'Single object' });
        done();
      });
  });

  it('should exclude "id" from an array of objects', (done) => {
    const data = [
      { id: 1, name: 'Test 1' },
      { id: 2, name: 'Test 2' },
    ];
    mockCallHandler.handle = jest.fn(() => of(data));

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toEqual([{ name: 'Test 1' }, { name: 'Test 2' }]);
        done();
      });
  });

  it('should return data as-is if no "id" field is present', (done) => {
    const data = { name: 'Test without ID' };
    mockCallHandler.handle = jest.fn(() => of(data));

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toEqual({ name: 'Test without ID' });
        done();
      });
  });

  it('should return non-object data as-is', (done) => {
    const data = 'Just a string';
    mockCallHandler.handle = jest.fn(() => of(data));

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toBe('Just a string');
        done();
      });
  });
});
