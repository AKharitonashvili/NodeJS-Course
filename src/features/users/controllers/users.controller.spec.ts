import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { ExcludeIdInterceptor } from '../../../common/interceptors/exclude-id.interceptor';
import {
  updateAdminMock,
  updateProfileMock,
  userMock,
} from '../mocks/user.mocks';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
    deleteById: jest.fn(),
    updateAdminStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideInterceptor(ExcludeIdInterceptor)
      .useValue({ intercept: jest.fn((ctx, next) => next.handle()) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should return user profile if found', async () => {
    const userId = 1;
    mockUsersService.findById.mockResolvedValue(userMock);

    const result = await controller.getProfile(userId);
    expect(result).toEqual(userMock);
    expect(mockUsersService.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFoundException if user profile not found', async () => {
    const userId = 1;
    mockUsersService.findById.mockResolvedValue(null);

    await expect(controller.getProfile(userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update user profile', async () => {
    const userId = 1;
    const updatedProfile = {
      ...updateProfileMock,
      id: userId,
      email: 'user@example.com',
    };
    mockUsersService.updateProfile.mockResolvedValue(updatedProfile);

    const result = await controller.updateProfile(userId, updateProfileMock);
    expect(result).toEqual(updatedProfile);
    expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
      userId,
      updateProfileMock,
    );
  });

  it('should delete user profile', async () => {
    const userId = 1;
    mockUsersService.deleteById.mockResolvedValue(undefined);

    const result = await controller.deleteProfile(userId);
    expect(result).toEqual({ message: 'Profile deleted successfully' });
    expect(mockUsersService.deleteById).toHaveBeenCalledWith(userId);
  });

  it('should throw NotFoundException if user ID is invalid when deleting profile', async () => {
    const userId = null;

    await expect(controller.deleteProfile(userId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should set user as admin and return updated status', async () => {
    const updateAdminDto: UpdateAdminDto = updateAdminMock;
    const updatedUser = { id: 1, ...updateAdminMock, isAdmin: true };
    mockUsersService.updateAdminStatus.mockResolvedValue(updatedUser);

    const result = await controller.setAdmin(updateAdminDto);
    expect(result).toEqual({
      message: `User with email ${updateAdminDto.email} is now an admin`,
      user: updatedUser,
    });
    expect(mockUsersService.updateAdminStatus).toHaveBeenCalledWith(
      updateAdminDto.email,
    );
  });
});
