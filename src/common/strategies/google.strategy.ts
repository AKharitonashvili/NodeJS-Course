import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { UserRepositoryService } from '../repositories/user-repository/user-repository.service';
import { ActiveUsersService } from '../services/active-users/active-user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly usersRepository: UserRepositoryService,
    private readonly activeUsersService: ActiveUsersService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails } = profile;
    if (!emails || !name) {
      return done(
        new Error('Google profile is missing essential information'),
        null,
      );
    }

    const user = await this.usersRepository.findOrCreate({
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    });

    const activeUser = this.activeUsersService.findUserById(user.id);
    if (!activeUser) {
      this.activeUsersService.addUser({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        loggedInAt: new Date(),
      });
    }

    done(null, user);
  }
}
