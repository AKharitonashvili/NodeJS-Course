import { Test, TestingModule } from '@nestjs/testing';
import { ActiveUser } from '../../interfaces/active-user.interface';
import { ActiveUsersService } from './active-user.service';

describe('ActiveUsersService', () => {
  let service: ActiveUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActiveUsersService],
    }).compile();

    service = module.get<ActiveUsersService>(ActiveUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a user to active users', () => {
    const user: ActiveUser = {
      userId: 1,
      email: 'test@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };

    service.addUser(user);
    expect(service.getAllUsers()).toContain(user);
  });

  it('should remove a user from active users by user ID', () => {
    const user1: ActiveUser = {
      userId: 1,
      email: 'test1@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };
    const user2: ActiveUser = {
      userId: 2,
      email: 'test2@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };

    service.addUser(user1);
    service.addUser(user2);
    service.removeUser(1);

    expect(service.getAllUsers()).toEqual([user2]);
  });

  it('should retrieve all active users', () => {
    const user1: ActiveUser = {
      userId: 1,
      email: 'test1@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };
    const user2: ActiveUser = {
      userId: 2,
      email: 'test2@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };

    service.addUser(user1);
    service.addUser(user2);

    const activeUsers = service.getAllUsers();
    expect(activeUsers).toEqual([user1, user2]);
  });

  it('should find a user by ID', () => {
    const user1: ActiveUser = {
      userId: 1,
      email: 'test1@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };
    const user2: ActiveUser = {
      userId: 2,
      email: 'test2@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };

    service.addUser(user1);
    service.addUser(user2);

    const foundUser = service.findUserById(1);
    expect(foundUser).toEqual(user1);
  });

  it('should return undefined when finding a user by a non-existent ID', () => {
    const user: ActiveUser = {
      userId: 1,
      email: 'test@test.com',
      isAdmin: false,
      loggedInAt: new Date(),
    };

    service.addUser(user);

    const foundUser = service.findUserById(999);
    expect(foundUser).toBeUndefined();
  });
});
