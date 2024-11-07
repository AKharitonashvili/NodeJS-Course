import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../features/users/entities/user.entity';

export const UserDecorator = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);
