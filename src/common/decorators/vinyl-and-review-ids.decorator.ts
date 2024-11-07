import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const VinylAndReviewIds = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const vinylId = request.params['vinylId'];
    const reviewId = request.params['reviewId'];

    if (!vinylId || !reviewId) {
      throw new Error('Vinyl ID or Review ID is missing');
    }

    return {
      vinylId,
      reviewId,
    };
  },
);
