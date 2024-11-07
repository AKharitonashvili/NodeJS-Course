import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludeIdInterceptor<T extends Record<string, unknown>>
  implements NestInterceptor<T, Omit<T, 'id'> | Omit<T, 'id'>[]>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Omit<T, 'id'> | Omit<T, 'id'>[]> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = data as T & { id?: unknown };
          return rest;
        }

        if (Array.isArray(data)) {
          return data.map((item) => {
            if (item && typeof item === 'object') {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, ...rest } = item as T & { id?: unknown };
              return rest;
            }
            return item;
          });
        }

        return data;
      }),
    );
  }
}
