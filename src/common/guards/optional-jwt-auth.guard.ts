import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../features/users/entities/user.entity';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User>(
    _err: Error | null,
    user: TUser | null,
  ): TUser | null {
    return user || null;
  }
}
