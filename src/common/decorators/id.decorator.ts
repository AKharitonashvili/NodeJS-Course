import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

export const Id = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const id = request.params['id'];

  if (!id) {
    throw new Error('ID is missing');
  }

  return new ParseIntPipe().transform(id, {
    type: 'param',
    metatype: Number,
  });
});
