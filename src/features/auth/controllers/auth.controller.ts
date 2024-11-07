import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ActiveUsersService } from '../../../common/services/active-users/active-user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { UserDecorator } from '../../../common/decorators/user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activeUsersService: ActiveUsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirects to Google for authentication' })
  googleLogin() {
    // Redirects to Google for authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  async googleLoginCallback(@UserDecorator() googleUser: User) {
    const user = await this.authService.validateGoogleUser(googleUser);
    const accessToken = this.authService.generateJwt(user);

    return {
      accessToken,
      message: 'Login successful',
      isAdmin: user.isAdmin,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @ApiOperation({ summary: 'Logs out the authenticated user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader?.split(' ')[1];

    if (!bearerToken) {
      throw new UnauthorizedException('No Bearer token provided');
    }

    const decodedToken = this.jwtService.decode(bearerToken);

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = decodedToken.sub;

    if (userId) {
      this.authService.removeUserFromActiveList(userId);
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    throw new UnauthorizedException('User is not authorized');
  }

  @UseGuards(JwtAuthGuard)
  @Get('active-users')
  @ApiOperation({ summary: 'Gets a list of all active users' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'List of active users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActiveUsers() {
    return this.activeUsersService.getAllUsers();
  }
}
