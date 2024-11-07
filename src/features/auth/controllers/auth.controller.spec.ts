import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { ActiveUsersService } from '../../../common/services/active-users/active-user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { mockActiveUser, userMock } from '../../users/mocks/user.mocks';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let activeUsersService: ActiveUsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateGoogleUser: jest.fn(),
            generateJwt: jest.fn(),
            removeUserFromActiveList: jest.fn(),
          },
        },
        {
          provide: ActiveUsersService,
          useValue: {
            getAllUsers: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    activeUsersService = module.get<ActiveUsersService>(ActiveUsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('googleLogin', () => {
    it('should redirect to Google for authentication', () => {
      expect(() => authController.googleLogin()).not.toThrow();
    });
  });

  describe('googleLoginCallback', () => {
    it('should handle Google login callback and return access token', async () => {
      const googleUser = { id: 1, isAdmin: true } as User;
      const accessToken = 'mockAccessToken';
      jest
        .spyOn(authService, 'validateGoogleUser')
        .mockResolvedValue(googleUser);
      jest.spyOn(authService, 'generateJwt').mockReturnValue(accessToken);

      const result = await authController.googleLoginCallback(googleUser);

      expect(result).toEqual({
        accessToken,
        message: 'Login successful',
        isAdmin: googleUser.isAdmin,
      });
      expect(authService.validateGoogleUser).toHaveBeenCalledWith(googleUser);
      expect(authService.generateJwt).toHaveBeenCalledWith(googleUser);
    });
  });

  describe('logout', () => {
    it('should logout user with valid token', async () => {
      const mockUserId = 1;
      const mockRequest = {
        headers: { authorization: `Bearer mockToken` },
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(jwtService, 'decode')
        .mockReturnValue({ sub: mockUserId } as any);
      jest.spyOn(authService, 'removeUserFromActiveList').mockImplementation();

      await authController.logout(mockRequest, mockResponse);

      expect(authService.removeUserFromActiveList).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockRequest = { headers: {} } as unknown as Request;
      const mockResponse = {} as Response;

      await expect(
        authController.logout(mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalidToken' },
      } as unknown as Request;
      const mockResponse = {} as Response;

      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      await expect(
        authController.logout(mockRequest, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getActiveUsers', () => {
    it('should return list of active users', () => {
      const activeUsers = [mockActiveUser, { ...mockActiveUser, id: 2 }];
      jest
        .spyOn(activeUsersService, 'getAllUsers')
        .mockReturnValue(activeUsers);

      const result = authController.getActiveUsers();

      expect(result).toEqual(activeUsers);
      expect(activeUsersService.getAllUsers).toHaveBeenCalled();
    });
  });
});
