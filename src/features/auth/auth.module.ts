import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthService } from './services/auth.service';
import { CommonModule } from '../../common/common.module';
@Module({
  imports: [ConfigModule, PassportModule, UsersModule, CommonModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
