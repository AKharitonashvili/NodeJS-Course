import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UsersService } from '../services/users.service';
import { ExcludeIdInterceptor } from '../../../common/interceptors/exclude-id.interceptor';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { updateAdminMock, updateProfileMock } from '../mocks/user.mocks';
import { UserID } from '../../../common/decorators/user-id.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ExcludeIdInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('profile')
  async getProfile(@UserID() userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ExcludeIdInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    description: 'Data for updating user profile',
    schema: {
      example: updateProfileMock,
    },
  })
  @Patch('profile')
  async updateProfile(
    @UserID() userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete('profile')
  async deleteProfile(@UserID() userId: number) {
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    await this.usersService.deleteById(userId);
    return { message: 'Profile deleted successfully' };
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set user as admin' })
  @ApiResponse({ status: 200, description: 'User admin status updated' })
  @ApiBody({
    description: 'Data for setting admin status',
    schema: {
      example: updateAdminMock,
    },
  })
  @Patch('set-admin')
  async setAdmin(@Body() updateAdminDto: UpdateAdminDto) {
    const { email } = updateAdminDto;
    const updatedUser = await this.usersService.updateAdminStatus(email);

    return {
      message: `User with email ${email} is ${updatedUser.isAdmin ? 'now' : 'no longer'} an admin`,
      user: updatedUser,
    };
  }
}
