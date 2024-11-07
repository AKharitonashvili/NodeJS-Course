import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { updateProfileMock, userMock } from '../mocks/user.mocks';

describe('UsersService', () => {
  let service: UsersService;
  let userRepositoryService: UserRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepositoryService,
          useValue: {
            findByIdWithRelations: jest.fn(),
            findByEmail: jest.fn(),
            findOrCreate: jest.fn(),
            updateAdminStatus: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepositoryService = module.get<UserRepositoryService>(
      UserRepositoryService,
    );
  });

  it('should find a user by ID', async () => {
    const user: User = userMock;
    jest
      .spyOn(userRepositoryService, 'findByIdWithRelations')
      .mockResolvedValue(user);

    const result = await service.findById(1);
    expect(result).toEqual(user);
    expect(userRepositoryService.findByIdWithRelations).toHaveBeenCalledWith(1);
  });

  it('should find a user by email', async () => {
    const email = userMock.email;
    const user: User = userMock;
    jest.spyOn(userRepositoryService, 'findByEmail').mockResolvedValue(user);

    const result = await service.findByEmail(email);
    expect(result).toEqual(user);
    expect(userRepositoryService.findByEmail).toHaveBeenCalledWith(email);
  });

  it('should find or create a user', async () => {
    const userData: Partial<User> = { email: 'test@example.com' };
    const user: User = { id: 1, ...userData } as User;
    jest.spyOn(userRepositoryService, 'findOrCreate').mockResolvedValue(user);

    const result = await service.findOrCreate(userData);
    expect(result).toEqual(user);
    expect(userRepositoryService.findOrCreate).toHaveBeenCalledWith(
      userData,
      false,
    );
  });

  it('should update admin status', async () => {
    const email = 'test@example.com';
    const updatedUser: User = { id: 1, email, isAdmin: true } as User;
    jest
      .spyOn(userRepositoryService, 'updateAdminStatus')
      .mockResolvedValue(updatedUser);

    const result = await service.updateAdminStatus(email);
    expect(result).toEqual(updatedUser);
    expect(userRepositoryService.updateAdminStatus).toHaveBeenCalledWith(email);
  });

  it('should update a user profile', async () => {
    const id = 1;
    const user: User = userMock;
    const updatedUser: User = { ...user, ...updateProfileMock };

    jest.spyOn(userRepositoryService, 'findById').mockResolvedValue(user);
    jest.spyOn(userRepositoryService, 'save').mockResolvedValue(updatedUser);

    const result = await service.updateProfile(id, updateProfileMock);
    expect(result).toEqual(updatedUser);
    expect(userRepositoryService.findById).toHaveBeenCalledWith(id);
    expect(userRepositoryService.save).toHaveBeenCalledWith(updatedUser);
  });

  it('should throw NotFoundException if user not found when updating profile', async () => {
    jest.spyOn(userRepositoryService, 'findById').mockResolvedValue(undefined);

    await expect(service.updateProfile(1, updateProfileMock)).rejects.toThrow(
      NotFoundException,
    );
    expect(userRepositoryService.findById).toHaveBeenCalledWith(1);
  });

  it('should delete a user by ID', async () => {
    const id = 1;
    const user: User = userMock;
    jest.spyOn(userRepositoryService, 'findById').mockResolvedValue(user);
    jest.spyOn(userRepositoryService, 'delete').mockResolvedValue();

    await service.deleteById(id);

    expect(userRepositoryService.findById).toHaveBeenCalledWith(id);
    expect(userRepositoryService.delete).toHaveBeenCalledWith(id);
  });

  it('should throw NotFoundException if user not found when deleting', async () => {
    jest.spyOn(userRepositoryService, 'findById').mockResolvedValue(undefined);

    await expect(service.deleteById(1)).rejects.toThrow(NotFoundException);
    expect(userRepositoryService.findById).toHaveBeenCalledWith(1);
  });
});
