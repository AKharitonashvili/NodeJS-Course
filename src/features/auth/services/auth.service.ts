import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { ActiveUsersService } from '../../../common/services/active-users/active-user.service';
import { User } from '../../users/entities/user.entity';
import { GoogleUser } from '../../../common/interfaces/google-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepositoryService,
    private readonly jwtService: JwtService,
    private readonly activeUsersService: ActiveUsersService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser): Promise<User> {
    const user = await this.userRepository.findOrCreate({
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
    });

    return user;
  }

  generateJwt(user: Partial<User>): string {
    const payload = {
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
    };
    return this.jwtService.sign(payload);
  }

  removeUserFromActiveList(userId: number): void {
    this.activeUsersService.removeUser(userId);
  }
}
