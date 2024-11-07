import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRepositoryService } from '../repositories/user-repository/user-repository.service';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  constructor(private readonly usersRepository: UserRepositoryService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    const user = await this.usersRepository.findById(userId);
    if (user && user.isAdmin) {
      return true;
    }

    throw new UnauthorizedException(
      'Only admins are allowed to access this route.',
    );
  }
}
