/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiQueries(
  queries: {
    name: string;
    required: boolean;
    description?: string;
    example?: any;
    enum?: any[];
  }[],
) {
  return applyDecorators(...queries.map((query) => ApiQuery(query)));
}
