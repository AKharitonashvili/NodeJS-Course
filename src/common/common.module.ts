import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../features/users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AdminGuard } from './guards/admin.guard';
import { UserRepositoryService } from './repositories/user-repository/user-repository.service';
import { ActiveUsersService } from './services/active-users/active-user.service';
import { Review } from '../features/reviews/entities/review.entity';
import { Vinyl } from '../features/vinyl/entities/vinyl.entity';
import { PurchasedVinyl } from '../features/vinyl/entities/purchased-vinyl.entity';
import { VinylRepositoryService } from './repositories/vinyl-repository/vinyl-repository.service';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';
import { ReviewRepositoryService } from './repositories/review-repository/review-repository.service';
import { Log } from '../features/logging/entities/log.entity';

const guards = [JwtAuthGuard, AdminGuard, OptionalJwtAuthGuard];
const strategies = [JwtStrategy, GoogleStrategy];
const services = [
  UserRepositoryService,
  VinylRepositoryService,
  ReviewRepositoryService,
  ActiveUsersService,
];
const modules = [JwtModule, TypeOrmModule];

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Review, Vinyl, PurchasedVinyl, Log]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<string>('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [...services, ...strategies, ...guards],
  exports: [...modules, ...services, ...strategies, ...guards],
})
export class CommonModule {}
