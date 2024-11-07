import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { JwtService } from '@nestjs/jwt';
import { ActiveUsersService } from '../../../common/services/active-users/active-user.service';
import { User } from '../../users/entities/user.entity';
import { GoogleUser } from '../../../common/interfaces/google-user.interface';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepositoryService;
  let jwtService: JwtService;
  let activeUsersService: ActiveUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepositoryService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ActiveUsersService,
          useValue: {
            removeUser: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepositoryService>(UserRepositoryService);
    jwtService = module.get<JwtService>(JwtService);
    activeUsersService = module.get<ActiveUsersService>(ActiveUsersService);
  });

  it('should validate Google user by finding or creating them', async () => {
    const googleUser: GoogleUser = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    const createdUser = { id: 1, email: googleUser.email } as User;
    jest.spyOn(userRepository, 'findOrCreate').mockResolvedValue(createdUser);

    const result = await authService.validateGoogleUser(googleUser);

    expect(userRepository.findOrCreate).toHaveBeenCalledWith({
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
    });
    expect(result).toEqual(createdUser);
  });

  it('should generate JWT token for a user', () => {
    const user: Partial<User> = {
      id: 1,
      email: 'test@example.com',
      isAdmin: true,
    };
    const token = 'generated.jwt.token';
    jest.spyOn(jwtService, 'sign').mockReturnValue(token);

    const result = authService.generateJwt(user);

    expect(jwtService.sign).toHaveBeenCalledWith({
      email: user.email,
      sub: user.id,
      isAdmin: user.isAdmin,
    });
    expect(result).toBe(token);
  });

  it('should remove user from active list', () => {
    const userId = 1;
    authService.removeUserFromActiveList(userId);

    expect(activeUsersService.removeUser).toHaveBeenCalledWith(userId);
  });
});
