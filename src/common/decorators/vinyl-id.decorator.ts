import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common';

export const VinylId = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const vinylId = request.params['vinylId'];

  if (!vinylId) {
    throw new Error('Vinyl ID is missing');
  }

  return new ParseIntPipe().transform(vinylId, {
    type: 'param',
    metatype: Number,
  });
});
