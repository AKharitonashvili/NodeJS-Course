import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ActiveUsersService } from '../services/active-users/active-user.service';
import { JwtPayload } from '../interfaces/token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly activeUsersService: ActiveUsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: userId, email } = payload;

    const activeUser = this.activeUsersService.findUserById(userId);
    if (!activeUser) {
      throw new UnauthorizedException('User is not authorized.');
    }

    return { userId, email };
  }
}
